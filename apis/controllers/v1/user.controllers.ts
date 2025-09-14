import "dotenv/config"
import prisma from "../config/client"
import { SUCCESS, BAD_REQUEST, CREATED, ProtectedRequest, UNAUTHORIZED } from "../types/constants"
import {Request, Response } from "express"
import bcrypt from "bcrypt"

export const GetAllUsers = async function (req: Request, res: Response) {
    const users = await prisma.user.findMany()
    res.json({"data": users})
}

export const GetUserById = async function (req: Request, res: Response){
    const userId = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(BAD_REQUEST).json({"Error message": "User not found"});
        }

        const { password, ...userData } = user;
        res.status(SUCCESS).json({"data": userData});
    } catch (e) {
        res.status(BAD_REQUEST).json({
            "Error message": e
        });
    }
}

export const GetCurrentUser = async function (req: ProtectedRequest, res: Response){
    const userId = req.user?.id;
    try {
        if (!userId) {
            return res.status(UNAUTHORIZED).json({"Error message": "Unauthorized, access denied"});
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(BAD_REQUEST).json({"Error message": "User not found"});
        }

        const { password, ...userData } = user;
        res.status(SUCCESS).json({"data": userData});
    } catch (e) {
        res.status(BAD_REQUEST).json({
            "Error message": e
        });
    }
}

export const CreateUser = async function (req: Request, res: Response){
    const userData = req.body;
    try {
        const hashSecret = process.env.PASSWORD_HASH_SECRET;
        if (!hashSecret) {
            throw new Error("PASSWORD_HASH_SECRET environment variable is not set.");
        }

        if (!userData.password){
            throw new Error("Password is not found in the request data")
        }

        const hashedPassword = await bcrypt.hash(userData.password, hashSecret);
        const user = await prisma.user.create({
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                picture: userData?.picture,
                password: hashedPassword,
            }
        });
        res.status(CREATED).json({"data": user});
    } catch (e) {
        res.status(BAD_REQUEST).json({
            "Error message": e
        });
    }
}

export const UpdateUserById = async function (req: Request, res: Response){
    const userId = req.params.id;
    const userData = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...userData
            }
        });

        const { password, ...userUpdatedData } = user;
        res.status(SUCCESS).json({"data": userUpdatedData});
    } catch (e) {
        res.status(BAD_REQUEST).json({
            "Error message": e
        });
    }
}


export const DeleteUserById = async function (req: Request, res: Response){
    const userId = req.params.id;

    try {
        const user = await prisma.user.delete({
            where: { id: userId }
        });
        res.status(SUCCESS).json({"data": user});
    } catch (e) {
        res.status(BAD_REQUEST).json({
            "Error message": e
        });
    }
}