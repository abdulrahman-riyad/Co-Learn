import prisma from "../../config/client.js";
import {
  SUCCESS,
  BAD_REQUEST,
  CREATED,
  UNAUTHORIZED,
  CONFLICT,
  NOT_FOUND,
} from "../../types/constants.js";
import { ProtectedRequest } from "../../types/types.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const GetAllUsers = async function (req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
        createdAt: true,
      },
    });
    res.status(SUCCESS).json({ users });
  } catch (e) {
    res.status(BAD_REQUEST).json({
      "Error message": e,
    });
  }
};

export const GetUserById = async function (req: Request, res: Response) {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: {
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(NOT_FOUND).json({ "Error message": "User not found" });
    }
    res.status(SUCCESS).json({ user });
  } catch (e) {
    res.status(BAD_REQUEST).json({
      "Error message": e,
    });
  }
};

export const GetCurrentUser = async function (
  req: ProtectedRequest,
  res: Response
) {
  const userId = req.user?.id;
  try {
    if (!userId) {
      return res
        .status(UNAUTHORIZED)
        .json({ "Error message": "Unauthorized, access denied" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: {
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res
        .status(BAD_REQUEST)
        .json({ "Error message": "User not found" });
    }

    res.status(SUCCESS).json({ user });
  } catch (e) {
    res.status(BAD_REQUEST).json({
      "Error message": e,
    });
  }
};

export const CreateUser = async function (req: Request, res: Response) {
  const userData = req.body;
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    if (!userData.password) {
      throw new Error("Password is not found in the request data");
    }

    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        picture: userData?.picture,
        password: hashedPassword,
      },
      omit: {
        password: true,
        createdAt: true,
      },
    });

    res.status(CREATED).json({ user });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint failed")) {
      return res.status(CONFLICT).json({
        "Error message": "User with the same email already exists",
      });
    }
    res.status(BAD_REQUEST).json({
      "Error message": e,
    });
  }
};

export const UpdateUserById = async function (req: Request, res: Response) {
  const userId = req.params.id;
  const userData = req.body;

  try {
    if (userData?.password) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
      },
      omit: {
        password: true,
        createdAt: true,
      },
    });

    res.status(SUCCESS).json({ user });
  } catch (e) {
    res.status(BAD_REQUEST).json({
      "Error message": e,
    });
  }
};

export const DeleteUserById = async function (req: Request, res: Response) {
  const userId = req.params.id;

  try {
    prisma.user
      .delete({
        where: { id: userId },
      })
      .then(() => {
        res.status(SUCCESS).json({ message: "User deleted successfully" });
      })
      .catch((error: PrismaClientKnownRequestError) => {
        res.status(NOT_FOUND).json({ "Error message": error.meta?.cause });
      });
  } catch (e) {
    res.status(BAD_REQUEST).json({
      "Error message": e,
    });
  }
};
