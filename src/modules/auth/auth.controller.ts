import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AuthService from "./auth.service";
import httpStatus from "http-status";
import { IRefreshTokenPayload } from "./auth.interface";

const register = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.registerUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken, user } = result;

    // Set cookie
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (or match token duration)
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            user,
            accessToken,
        },
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = (req.cookies ?? {}) as IRefreshTokenPayload;
    if (!refreshToken) {
        throw new Error("Refresh token not found");
    }

    const result = await AuthService.refreshTokenService(refreshToken);

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token refreshed successfully",
        data: result,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new Error("You are not authenticated");
    }
    
    const fullUser = await AuthService.getMe(user.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile fetched successfully",
        data: fullUser,
    });
});


const logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged out successfully",
        data: null,
    });
});

const AuthController = {
    register,
    login,
    refreshToken,
    getMe,
    logout,
};

export default AuthController;

