import { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (payload: object, secret: string, expiresIn: SignOptions) => {
        return jwt.sign(payload, secret, expiresIn);
}
const verifyToken = (token: string, secret: string) => {
    try {
        const verifiedToken = jwt.verify(token, secret);
        return verifiedToken;
    } catch (error :any) {
        console.log(error)
        throw new Error(error.message);
    }
}


export const jwtUtils = {createToken , verifyToken};