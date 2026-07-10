import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import GearService from "./gear.service";
import httpStatus from "http-status";

const getAll = catchAsync(async (req: Request, res: Response) => {
    const result = await GearService.getAllGear(req.query as any);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear items retrieved successfully",
        data: result,
    });
});

const getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await GearService.getGearById(id);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear item details retrieved successfully",
        data: result,
    });
});

const add = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const result = await GearService.addGearItem(providerId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Gear item added to inventory successfully",
        data: result,
    });
});

const update = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const { id } = req.params as { id: string };
    const result = await GearService.updateGearItem(providerId, id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear listing updated successfully",
        data: result,
    });
});

const remove = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const { id } = req.params as { id: string };
    await GearService.deleteGearItem(providerId, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Gear listing removed successfully",
        data: null,
    });
});

const GearController = {
    getAll,
    getById,
    add,
    update,
    remove,
};

export default GearController;

