import { prisma } from "../../lib/prisma";
import { GearAvailability } from "../../../prisma/generated/prisma/enums";

const getAllGear = async (query: {
    category?: string;
    brand?: string;
    priceMin?: string;
    priceMax?: string;
    searchTerm?: string;
    availability?: GearAvailability;
    providerId?: string;
}) => {
    const { category, brand, priceMin, priceMax, searchTerm, availability, providerId } = query;
    const whereConditions: any = {};

    if (providerId) {
        whereConditions.providerId = providerId;
    }


    if (category) {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(category);
        if (isUuid) {
            whereConditions.categoryId = category;
        } else {
            whereConditions.category = {
                name: {
                    contains: category,
                    mode: "insensitive",
                },
            };
        }
    }

    if (brand) {
        whereConditions.brand = {
            contains: brand,
            mode: "insensitive",
        };
    }

    if (priceMin || priceMax) {
        whereConditions.dailyRentalPrice = {};
        if (priceMin) {
            whereConditions.dailyRentalPrice.gte = Number(priceMin);
        }
        if (priceMax) {
            whereConditions.dailyRentalPrice.lte = Number(priceMax);
        }
    }

    if (availability) {
        whereConditions.availability = availability;
    }

    if (searchTerm) {
        whereConditions.OR = [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { brand: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
        ];
    }

    const gears = await prisma.gearItem.findMany({
        where: whereConditions,
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
    });

    return gears;
};

const getGearById = async (id: string) => {
    const gear = await prisma.gearItem.findUnique({
        where: { id },
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
            reviews: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            profileImage: true,
                        },
                    },
                },
            },
        },
    });

    if (!gear) {
        throw new Error("Gear item not found");
    }

    return gear;
};

// Provider Methods
const addGearItem = async (
    providerId: string,
    payload: {
        name: string;
        brand: string;
        description: string;
        dailyRentalPrice: number;
        stock: number;
        categoryId: string;
        specifications?: any;
        images?: string[];
    }
) => {
    // Validate category exists
    const categoryExists = await prisma.category.findUnique({
        where: { id: payload.categoryId },
    });
    if (!categoryExists) {
        throw new Error("Category not found");
    }

    const gear = await prisma.gearItem.create({
        data: {
            providerId,
            name: payload.name,
            brand: payload.brand,
            description: payload.description,
            dailyRentalPrice: Number(payload.dailyRentalPrice),
            stock: Number(payload.stock),
            availableStock: Number(payload.stock),
            categoryId: payload.categoryId,
            specifications: payload.specifications || null,
            images: payload.images || [],
        },
        include: {
            category: true,
        },
    });

    return gear;
};

const updateGearItem = async (
    providerId: string,
    id: string,
    payload: {
        name?: string;
        brand?: string;
        description?: string;
        dailyRentalPrice?: number;
        stock?: number;
        categoryId?: string;
        availability?: GearAvailability;
        specifications?: any;
        images?: string[];
    }
) => {
    const gear = await prisma.gearItem.findUnique({
        where: { id },
    });

    if (!gear) {
        throw new Error("Gear item not found");
    }

    if (gear.providerId !== providerId) {
        throw new Error("Unauthorized to edit this gear item");
    }

    if (payload.categoryId) {
        const categoryExists = await prisma.category.findUnique({
            where: { id: payload.categoryId },
        });
        if (!categoryExists) {
            throw new Error("Category not found");
        }
    }

    const updateData: any = { ...payload };

    if (payload.dailyRentalPrice !== undefined) {
        updateData.dailyRentalPrice = Number(payload.dailyRentalPrice);
    }

    if (payload.stock !== undefined) {
        const newStock = Number(payload.stock);
        const stockDiff = newStock - gear.stock;
        updateData.stock = newStock;

        // Adjust availableStock accordingly
        const newAvailableStock = Math.max(0, gear.availableStock + stockDiff);
        updateData.availableStock = newAvailableStock;
    }

    const updatedGear = await prisma.gearItem.update({
        where: { id },
        data: updateData,
        include: {
            category: true,
        },
    });

    return updatedGear;
};

const deleteGearItem = async (providerId: string, id: string) => {
    const gear = await prisma.gearItem.findUnique({
        where: { id },
    });

    if (!gear) {
        throw new Error("Gear item not found");
    }

    if (gear.providerId !== providerId) {
        throw new Error("Unauthorized to delete this gear item");
    }

    await prisma.gearItem.delete({
        where: { id },
    });

    return null;
};

const GearService = {
    getAllGear,
    getGearById,
    addGearItem,
    updateGearItem,
    deleteGearItem,
};

export default GearService;

