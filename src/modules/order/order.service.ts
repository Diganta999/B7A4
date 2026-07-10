import { IAuthUser } from "../auth/auth.interface";
import { prisma } from "../../lib/prisma";
import { GearAvailability, RentalStatus, Role } from "../../../prisma/generated/prisma/enums";
import { ICreateRentalOrderPayload, IOrderQuery, IUpdateRentalOrderStatusPayload } from "./order.interface";

const rentalOrderInclude = {
    customer: {
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
        },
    },
    items: {
        include: {
            gearItem: {
                include: {
                    category: true,
                    provider: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            profileImage: true,
                        },
                    },
                },
            },
        },
    },
    payment: true,
};

const dayInMs = 24 * 60 * 60 * 1000;

const getRentalDays = (startDate: Date, endDate: Date) => {
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / dayInMs));
};

const validateRentalDates = (startDateInput: string | Date, endDateInput: string | Date) => {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new Error("Valid startDate and endDate are required");
    }

    if (endDate <= startDate) {
        throw new Error("endDate must be after startDate");
    }

    return { startDate, endDate };
};

const normalizeItems = (payload: ICreateRentalOrderPayload) => {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
        throw new Error("At least one rental item is required");
    }

    const itemMap = new Map<string, number>();

    payload.items.forEach((item) => {
        const quantity = Number(item.quantity);

        if (!item.gearItemId) {
            throw new Error("gearItemId is required for each item");
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("Item quantity must be a positive integer");
        }

        itemMap.set(item.gearItemId, (itemMap.get(item.gearItemId) ?? 0) + quantity);
    });

    return Array.from(itemMap, ([gearItemId, quantity]) => ({ gearItemId, quantity }));
};

const validateRentalStatus = (status: RentalStatus) => {
    if (!Object.values(RentalStatus).includes(status)) {
        throw new Error("Invalid rental status");
    }
};

const createRentalOrder = async (customerId: string, payload: ICreateRentalOrderPayload) => {
    const { startDate, endDate } = validateRentalDates(payload.startDate, payload.endDate);
    const requestedItems = normalizeItems(payload);
    const rentalDays = getRentalDays(startDate, endDate);
    const gearItemIds = requestedItems.map((item) => item.gearItemId);

    const gearItems = await prisma.gearItem.findMany({
        where: {
            id: {
                in: gearItemIds,
            },
        },
    });

    if (gearItems.length !== gearItemIds.length) {
        throw new Error("One or more gear items were not found");
    }

    const orderItems = gearItems.map((gear) => {
        const requestedItem = requestedItems.find((item) => item.gearItemId === gear.id);

        if (!requestedItem) {
            throw new Error("Invalid rental item");
        }

        if (gear.availability !== GearAvailability.AVAILABLE || gear.availableStock < requestedItem.quantity) {
            throw new Error(`${gear.name} is not available in the requested quantity`);
        }

        const subtotal = gear.dailyRentalPrice * rentalDays * requestedItem.quantity;

        return {
            gearItemId: gear.id,
            quantity: requestedItem.quantity,
            pricePerDay: gear.dailyRentalPrice,
            subtotal,
            availableStock: gear.availableStock,
            stock: gear.stock,
        };
    });

    const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);

    return prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
            const updateResult = await tx.gearItem.updateMany({
                where: {
                    id: item.gearItemId,
                    availability: GearAvailability.AVAILABLE,
                    availableStock: {
                        gte: item.quantity,
                    },
                },
                data: {
                    availableStock: {
                        decrement: item.quantity,
                    },
                    availability:
                        item.availableStock - item.quantity === 0
                            ? GearAvailability.OUT_OF_STOCK
                            : GearAvailability.AVAILABLE,
                },
            });

            if (updateResult.count !== 1) {
                throw new Error("Gear stock changed while placing the rental order. Please try again");
            }
        }

        return tx.rentalOrder.create({
            data: {
                customerId,
                startDate,
                endDate,
                totalAmount,
                items: {
                    create: orderItems.map((item) => ({
                        gearItemId: item.gearItemId,
                        quantity: item.quantity,
                        pricePerDay: item.pricePerDay,
                        subtotal: item.subtotal,
                    })),
                },
            },
            include: rentalOrderInclude,
        });
    });
};

const getMyRentalOrders = async (customerId: string, query: IOrderQuery) => {
    const whereConditions: {
        customerId: string;
        status?: RentalStatus;
    } = {
        customerId,
    };

    if (query.status) {
        validateRentalStatus(query.status);
        whereConditions.status = query.status;
    }

    return prisma.rentalOrder.findMany({
        where: whereConditions,
        include: rentalOrderInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getAllRentalOrders = async (query: IOrderQuery) => {
    const whereConditions: {
        status?: RentalStatus;
    } = {};

    if (query.status) {
        validateRentalStatus(query.status);
        whereConditions.status = query.status;
    }

    return prisma.rentalOrder.findMany({
        where: whereConditions,
        include: rentalOrderInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getRentalOrderById = async (authUser: IAuthUser, id: string) => {
    const order = await prisma.rentalOrder.findUnique({
        where: { id },
        include: rentalOrderInclude,
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    if (authUser.role === Role.ADMIN) {
        return order;
    }

    if (authUser.role === Role.CUSTOMER && order.customerId === authUser.id) {
        return order;
    }

    const hasProviderItem = order.items.some((item) => item.gearItem.providerId === authUser.id);

    if (authUser.role === Role.PROVIDER && hasProviderItem) {
        return order;
    }

    throw new Error("Unauthorized to access this rental order");
};

const getProviderRentalOrders = async (providerId: string, query: IOrderQuery) => {
    const whereConditions: {
        status?: RentalStatus;
        items: {
            some: {
                gearItem: {
                    providerId: string;
                };
            };
        };
    } = {
        items: {
            some: {
                gearItem: {
                    providerId,
                },
            },
        },
    };

    if (query.status) {
        validateRentalStatus(query.status);
        whereConditions.status = query.status;
    }

    return prisma.rentalOrder.findMany({
        where: whereConditions,
        include: {
            ...rentalOrderInclude,
            items: {
                where: {
                    gearItem: {
                        providerId,
                    },
                },
                include: rentalOrderInclude.items.include,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const restoreReservedStock = async (
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    orderId: string
) => {
    const order = await tx.rentalOrder.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    gearItem: true,
                },
            },
        },
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    for (const item of order.items) {
        const newAvailableStock = Math.min(item.gearItem.stock, item.gearItem.availableStock + item.quantity);

        await tx.gearItem.update({
            where: {
                id: item.gearItemId,
            },
            data: {
                availableStock: newAvailableStock,
                availability: newAvailableStock > 0 ? GearAvailability.AVAILABLE : GearAvailability.OUT_OF_STOCK,
            },
        });
    }
};

const updateProviderRentalOrderStatus = async (
    providerId: string,
    id: string,
    payload: IUpdateRentalOrderStatusPayload
) => {
    const { status } = payload;
    validateRentalStatus(status);

    const allowedStatuses: RentalStatus[] = [
        RentalStatus.CONFIRMED,
        RentalStatus.PICKED_UP,
        RentalStatus.RETURNED,
        RentalStatus.CANCELLED,
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Providers can only confirm, mark picked up, mark returned, or cancel rental orders");
    }

    const order = await prisma.rentalOrder.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    gearItem: true,
                },
            },
        },
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    const hasProviderItem = order.items.some((item) => item.gearItem.providerId === providerId);

    if (!hasProviderItem) {
        throw new Error("Unauthorized to update this rental order");
    }

    const stockRestoringStatuses: RentalStatus[] = [RentalStatus.RETURNED, RentalStatus.CANCELLED];
    const shouldRestoreStock =
        stockRestoringStatuses.includes(status) && !stockRestoringStatuses.includes(order.status);

    return prisma.$transaction(async (tx) => {
        if (shouldRestoreStock) {
            await restoreReservedStock(tx, id);
        }

        return tx.rentalOrder.update({
            where: { id },
            data: { status },
            include: rentalOrderInclude,
        });
    });
};

const OrderService = {
    createRentalOrder,
    getMyRentalOrders,
    getAllRentalOrders,
    getRentalOrderById,
    getProviderRentalOrders,
    updateProviderRentalOrderStatus,
};

export default OrderService;
