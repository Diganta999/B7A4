import { Role } from "../../../prisma/generated/prisma/enums";

export interface ILoginUser {
    email: string;
    password: string;
}

export interface IRefreshTokenPayload {
    refreshToken?: string;
}

export interface IAuthUser {
    id: string;
    role: Role;
    name: string;
    email: string;
}

export interface ILoginResponse {
    user: Omit<IAuthUser, "id"> & { id: string };
    accessToken: string;
    refreshToken: string;
}