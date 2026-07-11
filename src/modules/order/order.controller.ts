import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import OrderService from "./order.service";
import { IOrderQuery } from "./order.interface";

const create = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await OrderService.createRentalOrder(customerId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Rental order created successfully",
        data: result,
    });
});

const getMine = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await OrderService.getMyRentalOrders(customerId, req.query as IOrderQuery);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rental orders retrieved successfully",
        data: result,
    });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getAllRentalOrders(req.query as IOrderQuery);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All rental orders retrieved successfully",
        data: result,
    });
});

const getById = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new Error("You are not authenticated");
    }

    const { id } = req.params as { id: string };
    const result = await OrderService.getRentalOrderById(user, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rental order details retrieved successfully",
        data: result,
    });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const result = await OrderService.getProviderRentalOrders(providerId, req.query as IOrderQuery);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Provider rental orders retrieved successfully",
        data: result,
    });
});

const updateProviderStatus = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const { id } = req.params as { id: string };
    const result = await OrderService.updateProviderRentalOrderStatus(providerId, id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rental order status updated successfully",
        data: result,
    });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const { id } = req.params as { id: string };
    const result = await OrderService.cancelRentalOrder(customerId, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rental order cancelled successfully",
        data: result,
    });
});

const OrderController = {
    create,
    getMine,
    getAll,
    getById,
    getProviderOrders,
    updateProviderStatus,
    cancelOrder,
};

export default OrderController;
