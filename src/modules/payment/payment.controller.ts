import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import PaymentService from "./payment.service";

const create = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await PaymentService.createPayment(customerId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment created successfully",
        data: result,
    });
});

const confirm = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.confirmPayment(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment confirmed successfully",
        data: result,
    });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new Error("You are not authenticated");
    }

    const result = await PaymentService.getPayments(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result,
    });
});

const getById = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new Error("You are not authenticated");
    }

    const { id } = req.params as { id: string };
    const result = await PaymentService.getPaymentById(user, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment details retrieved successfully",
        data: result,
    });
});

const PaymentController = {
    create,
    confirm,
    getAll,
    getById,
};

export default PaymentController;
