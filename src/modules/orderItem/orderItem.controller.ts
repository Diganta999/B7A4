import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import OrderItemService from "./orderItem.service";

const getAll = catchAsync(async (_req: Request, res: Response) => {
    const result = await OrderItemService.getAllOrderItems();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order items retrieved successfully",
        data: result,
    });
});

const getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await OrderItemService.getOrderItemById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order item retrieved successfully",
        data: result,
    });
});

const OrderItemController = {
    getAll,
    getById,
};

export default OrderItemController;
