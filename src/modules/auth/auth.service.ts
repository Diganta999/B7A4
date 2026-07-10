import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { ILoginUser } from "./auth.interface";
import { Role } from "../../../prisma/generated/prisma/enums";
import { SignOptions, JwtPayload } from "jsonwebtoken";


const registerUser = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    phone?: string;
    address?: string;
    profileImage?: string;
}) => {
    // Basic input validation
    if (!payload.email || !payload.password || !payload.name) {
        throw new Error("Name, email, and password are required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
        throw new Error("Invalid email format");
    }

    if (payload.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (payload.role && !Object.values(Role).includes(payload.role)) {
        throw new Error("Invalid role selected");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }


    // Role validation: Admin cannot register themselves via public route
    if (payload.role === Role.ADMIN) {
        throw new Error("Cannot register with ADMIN role");
    }

    // Hash password
    const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
            role: payload.role || Role.CUSTOMER,
            phone: payload.phone,
            address: payload.address,
            profileImage: payload.profileImage,
        },
        omit: {
            password: true,
        },
    });

    return newUser;
};

const loginUser = async (payload: ILoginUser) => {
    if (!payload.email || !payload.password) {
        throw new Error("Email and password are required");
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });


    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check status
    if (user.status === "SUSPENDED") {
        throw new Error("Your account has been suspended");
    }

    // Compare password
    const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Invalid email or password");
    }

    // Generate token
    const jwtPayload = {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
    };

    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_secret as string, { expiresIn: config.jwt_expiration as string } as SignOptions);
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret as string, { expiresIn: config.jwt_refresh_expiration as string } as SignOptions);


    return {
        accessToken,
        refreshToken
    };
};
const refreshTokenService = async (refreshToken: string) => {
    const decoded = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret as string) as JwtPayload;
    if (!decoded) {
        throw new Error("Invalid refresh token");
    }
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: decoded.id
        }
    });

    if (user.status === "SUSPENDED") {
        throw new Error("User is suspended");
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    const newAccessToken = jwtUtils.createToken(jwtPayload, config.jwt_secret as string, { expiresIn: config.jwt_expiration as string } as SignOptions);
    return { accessToken: newAccessToken };
};

const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        omit: {
            password: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const AuthService = {
    registerUser,
    loginUser,
    refreshTokenService,
    getMe,
};

export default AuthService;


