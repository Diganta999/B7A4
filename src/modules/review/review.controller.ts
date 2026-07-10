import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import ReviewService from "./review.service";

const create = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await ReviewService.createReview(customerId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Review created successfully",
        data: result,
    });
});

const ReviewController = {
    create,
};

export default ReviewController;
