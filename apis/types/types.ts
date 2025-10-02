import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

export interface ProtectedRequest extends Request {
    user?: {
        id: string
        email: string
        firstName: string
        lastName: string
        picture: string | null
    } | null
}

export interface UserPayload extends JwtPayload {
    userId?: string
}