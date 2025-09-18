import {Response, NextFunction} from "express";
import { ProtectedRequest } from "../types/types";
import { FORBIDDEN, ROLES, UNAUTHORIZED } from "../types/constants";
import prisma from "../config/client.ts";

export default async function authorizationMiddleware(
    req: ProtectedRequest,
    res: Response,
    next: NextFunction,
    allowedRoles: number[]
) {
    if (!req.user) {
        return res.status(UNAUTHORIZED).json({ message: "User not found" });
    }

    const classroomId = (req.query.classroomId || req.params.classroomId) as string;
    if (!classroomId) {
        return res.status(UNAUTHORIZED).json({ message: "Classroom ID is required" });
    }

    const userRole = await prisma.usersFoldersClassrooms.findFirst({
        where: {
            userId: req.user.id,
            classroomId: classroomId
        },
        select: {
            roleId: true
        }
    });

    if (!userRole || !allowedRoles.includes(userRole.roleId)) {
        return res.status(FORBIDDEN).json({ message: "Access denied" });
    }
    next();
}