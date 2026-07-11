import { IAuthUser } from "../modules/auth/auth.interface";

import { NextFunction, Request, Response } from "express";
import config from "../config";
import { jwtUtils } from "./jwt";
import { prisma } from "../lib/prisma";
import { Role } from "../../prisma/generated/prisma/enums";
import { sendResponse } from "./sendResponse";


declare global {
    namespace Express {
        interface Request {
            user?: IAuthUser;
        }
    }
}

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            throw new Error("Access token not found");
        }
        const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_secret as string) as IAuthUser;
        if (!verifiedToken) {
            throw new Error("Invalid access token");
        }
        if (!authRoles.includes(verifiedToken.role as Role)) {
            throw new Error("Unauthorized access");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: verifiedToken.id,
            }, omit: {
                password: true
            }
        });

        if (!user) {
            throw new Error("User not found . Please try again later");
        }
        if (user.role !== verifiedToken.role) {
            throw new Error("User role mismatch");
        }
        if (user.status === "SUSPENDED") {
            throw new Error("User is SUSPENDED");
        }

        req.user = verifiedToken;
        next();
    } catch (error) {
        sendResponse(res, {
            statusCode: 401,
            success: false,
            message: (error as Error).message,
            data: null
        });
    }
}