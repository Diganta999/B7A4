import { prisma } from "../../lib/prisma";

const getAllOrderItems = async () => {
    return prisma.rentalOrderItem.findMany();
};

const getOrderItemById = async (id: string) => {
    const orderItem = await prisma.rentalOrderItem.findUnique({
        where: { id },
    });

    if (!orderItem) {
        throw new Error("Order item not found");
    }

    return orderItem;
};

const OrderItemService = {
    getAllOrderItems,
    getOrderItemById,
};

export default OrderItemService;
