import { prisma } from "../../lib/prisma";
import { Role, UserStatus } from "../../../prisma/generated/prisma/enums";

const getAllUsers = async () => {
    return prisma.user.findMany({
        omit: {
            password: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const updateUserStatus = async (id: string, payload: { status: UserStatus }) => {
    if (!payload.status || !Object.values(UserStatus).includes(payload.status)) {
        throw new Error("Valid user status is required");
    }

    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return prisma.user.update({
        where: { id },
        data: {
            status: payload.status,
        },
        omit: {
            password: true,
        },
    });
};

const updateUserRole = async (id: string, payload: { role: Role }) => {
    if (!payload.role || !Object.values(Role).includes(payload.role)) {
        throw new Error("Valid user role is required");
    }

    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return prisma.user.update({
        where: { id },
        data: {
            role: payload.role,
        },
        omit: {
            password: true,
        },
    });
};

const updateUser = async (id: string, payload: { status?: UserStatus; role?: Role }) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updateData: { status?: UserStatus; role?: Role } = {};

    if (payload.status) {
        if (!Object.values(UserStatus).includes(payload.status)) {
            throw new Error("Valid user status is required");
        }
        updateData.status = payload.status;
    }

    if (payload.role) {
        if (!Object.values(Role).includes(payload.role)) {
            throw new Error("Valid user role is required");
        }
        updateData.role = payload.role;
    }

    if (Object.keys(updateData).length === 0) {
        throw new Error("At least status or role must be provided to update");
    }

    return prisma.user.update({
        where: { id },
        data: updateData,
        omit: {
            password: true,
        },
    });
};

const UserService = {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    updateUser,
};

export default UserService;

