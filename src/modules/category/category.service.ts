import { prisma } from "../../lib/prisma";

const getAllCategories = async () => {
	return prisma.category.findMany({
		orderBy: {
			createdAt: "asc",
		},
	});
};

const getCategoryById = async (id: string) => {
	const category = await prisma.category.findUnique({
		where: { id },
	});

	if (!category) {
		throw new Error("Category not found");
	}

	return category;
};

const createCategory = async (payload: { name: string; description?: string }) => {
	if (!payload.name) {
		throw new Error("Category name is required");
	}

	const existingCategory = await prisma.category.findUnique({
		where: { name: payload.name },
	});

	if (existingCategory) {
		throw new Error("Category already exists");
	}

	return prisma.category.create({
		data: {
			name: payload.name,
			description: payload.description,
		},
	});
};

const updateCategory = async (id: string, payload: { name?: string; description?: string }) => {
	const category = await prisma.category.findUnique({
		where: { id },
	});

	if (!category) {
		throw new Error("Category not found");
	}

	if (payload.name && payload.name !== category.name) {
		const existingCategory = await prisma.category.findUnique({
			where: { name: payload.name },
		});

		if (existingCategory) {
			throw new Error("Category already exists");
		}
	}

	return prisma.category.update({
		where: { id },
		data: {
			name: payload.name,
			description: payload.description,
		},
	});
};

const deleteCategory = async (id: string) => {
	const category = await prisma.category.findUnique({
		where: { id },
	});

	if (!category) {
		throw new Error("Category not found");
	}

	await prisma.category.delete({
		where: { id },
	});

	return null;
};

const CategoryService = {
	getAllCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
};

export default CategoryService;
