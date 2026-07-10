import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../prisma/generated/prisma/enums";

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

const UserService = {
    getAllUsers,
    updateUserStatus,
};

export default UserService;
