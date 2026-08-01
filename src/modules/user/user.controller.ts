import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import UserService from "./user.service";

const getAll = catchAsync(async (_req: Request, res: Response) => {
    const result = await UserService.getAllUsers();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result,
    });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await UserService.updateUserStatus(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await UserService.updateUserRole(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await UserService.updateUser(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});

const UserController = {
    getAll,
    updateStatus,
    updateRole,
    updateUser,
};

export default UserController;
