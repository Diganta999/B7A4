import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import CategoryService from "./category.service";

const getAll = catchAsync(async (_req: Request, res: Response) => {
	const result = await CategoryService.getAllCategories();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Categories retrieved successfully",
		data: result,
	});
});

const getById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const result = await CategoryService.getCategoryById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Category retrieved successfully",
		data: result,
	});
});

const add = catchAsync(async (req: Request, res: Response) => {
	const result = await CategoryService.createCategory(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Category created successfully",
		data: result,
	});
});

const update = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const result = await CategoryService.updateCategory(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Category updated successfully",
		data: result,
	});
});

const remove = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	await CategoryService.deleteCategory(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Category deleted successfully",
		data: null,
	});
});

const CategoryController = {
	getAll,
	getById,
	add,
	update,
	remove,
};

export default CategoryController;
