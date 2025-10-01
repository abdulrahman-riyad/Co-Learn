import db from "../../config/client.ts";
import {
  SUCCESS,
  BAD_REQUEST,
  CREATED,
  UNAUTHORIZED,
  CONFLICT,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../types/constants.ts";

import type { ProtectedRequest, UserPayload } from "../../types/types.ts";
import type { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ms from "ms";
import {Prisma} from "@prisma/client";

export const RegisterNewUser = async function (req: Request, res: Response) {
  const userInfo = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };
  if (!userInfo) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "User information is not defined" });
  }

  try {
    if (!userInfo?.password) {
      res
        .status(BAD_REQUEST)
        .json({ message: "Password is required for creating user" });
    }

    const salt = await bcrypt.genSalt(10);
    userInfo.password = await bcrypt.hash(userInfo.password, salt);
    await db.user.create({
      data: {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        password: userInfo.password,
      },
      omit: {
        password: true,
        createdAt: true,
      },
    });

    // TODO: Adding a message broker for sending verification emails

    res.status(CREATED).json({ message: "User registered successfully" });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002")
         return res.status(CONFLICT).json({ message: "User with this email already exists" });
      return res.status(BAD_REQUEST).json({ message: e.message });
    }
    res.status(SERVER_ERROR).json({ message: "Server error" });
  }
};

/**
 * Login a user by validating the credentials and generating access and refresh tokens
 * @param req 
 * @param res 
 * @returns response with user data and tokens or error message
 */

export const Login = async function (req: Request, res: Response) {
  const userInfo = {
    email: req.body.email,
    password: req.body.password,
  }

  // Validity checking
  if (!userInfo || !userInfo?.email || !userInfo?.password) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "User credentials is not provided" });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });
    if (!user || !user?.password) {
      return res
        .status(BAD_REQUEST)
        .json({ message: "User credentails is invalid" });
    }

    // TODO: Asserting on email verifications when messege queue broker is ready.
    const isMatched = await bcrypt.compare(userInfo.password, user!.password);
    if (!isMatched) {
      return res.status(UNAUTHORIZED).json({ message: "User credentails is invalid" });
    }

    // Getting the secrets
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error("jwt secret is not defined");
    }

    let accessToken, refershToken;

    // Configuring tokens according to the enviroment used
    if (process.env.NODE_ENV === "test") {
      accessToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 1,
        },
        accessTokenSecret,
        {
          algorithm: "HS512",
        }
      );

      refershToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 5,
        },
        refreshTokenSecret,
        {
          algorithm: "HS512",
        }
      );
      res.cookie("refreshToken", refershToken, {
        httpOnly: true,
        maxAge: ms("5 sec"),
      });
    } else {
      accessToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + ms("1 hour") / 1000,
        },
        accessTokenSecret,
        {
          algorithm: "HS512",
        }
      );

      refershToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + ms("7 days") / 1000,
        },
        refreshTokenSecret,
        {
          algorithm: "HS512",
        }
      );

      res.cookie("refreshToken", refershToken, {
        httpOnly: true,
        maxAge: ms("7 days"),
      });
    }

    const userData = await db.user.findUnique({
      where: {
        id: user.id,
      },
      omit: {
        password: true,
        createdAt: true,
      },
    });

    const token = await db.token.create({
      data: {
        userId: user.id,
        token: refershToken,
        expiresAt: new Date(Date.now() + ms("7 days")),
      }
    });

    // Setting the refreshTokenId cookie
    res.cookie("refreshTokenId", token.id, {
      httpOnly: true,
      maxAge: ms("7 days"),
    });

    res.status(SUCCESS).json({
      message: "User logged in successfully",
      user: userData,
      token: accessToken,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(BAD_REQUEST).json({ message: e.message });
    }

    res.status(SERVER_ERROR).json({ message: e });
  }
};

/**
 * Refresh the access token by using the refresh token stored in the cookies
 * @param req 
 * @param res 
 * @returns response with the new access token or error message
 */

export const RefreshAccessToken = async function (req: Request, res: Response) {
  const refreshToken = req.cookies["refreshToken"];
  const refreshTokenId = req.cookies["refreshTokenId"];


  if (!refreshToken || !refreshTokenId) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: "refreshToken is not provided" });
  }

  try {

    // Getting the secrets
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    if (!refreshTokenSecret || !accessTokenSecret) {
      throw new Error("jwt secret is not defined");
    }

    // Verifying the token
    const payload = jwt.verify(refreshToken, refreshTokenSecret, {
      algorithms: ["HS512"],
    }) as UserPayload;

    // Verifying if the token is not revoked
    if (!payload?.userId) {
      return res.status(UNAUTHORIZED).json({ message: "Invalid refreshToken" });
    }

    const storedToken = await db.token.findUnique({
      where: {
        id: refreshTokenId,
        userId: payload.userId,
      },
    });


    // Token validation
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return res.status(FORBIDDEN).json({ message: "Unauthorized, invalid refreshToken" });
    }


    // User validation
    const user = await db.user.findUnique({
      where: {
        id: payload?.userId,
      },

      omit: {
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(UNAUTHORIZED).json({ message: "Invalid userId" });
    }

    let accessToken, refershToken;

    if (process.env.NODE_ENV === "test") {
      accessToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 1,
        },
        accessTokenSecret,
        {
          algorithm: "HS512",
        }
      );

      refershToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 5,
        },
        refreshTokenSecret,
        {
          algorithm: "HS512",
        }
      );
      res.cookie("refreshToken", refershToken, {
        httpOnly: true,
        maxAge: ms("5 sec"),
      });
    } else {
      accessToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + ms("30 min") / 1000,
        },
        accessTokenSecret,
        {
          algorithm: "HS512",
        }
      );

      refershToken = jwt.sign(
        {
          userId: user?.id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + ms("7 days") / 1000,
        },
        refreshTokenSecret,
        {
          algorithm: "HS512",
        }
      );

      res.cookie("refreshToken", refershToken, {
        httpOnly: true,
        maxAge: ms("7 days"),
      });
    }

    const token = await db.token.create({
      data: {
        userId: user.id,
        token: refershToken,
        expiresAt: new Date(Date.now() + ms("7 days")),
      }
    });

    // Setting the refreshTokenId cookie
    res.cookie("refreshTokenId", token.id, {
      httpOnly: true,
      maxAge: ms("7 days"),
    });


    res.status(SUCCESS).json({
      message: "Access token refreshed successfully",
      token: accessToken,
      user,
    });
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(UNAUTHORIZED).json({ message: "Invalid refreshToken" });
    }
    res.status(SERVER_ERROR).json({ message: e });
  }
};


export const Logout = async function (req: ProtectedRequest, res: Response) {
  try {
    const refreshToken = req.cookies["refreshToken"];
    const refreshTokenId = req.cookies["refreshTokenId"];
    if (!refreshToken) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: "refreshToken is not provided" });
    }

    // delete the cookies
    res.clearCookie("refreshToken");
    res.clearCookie("refreshTokenId");

    // soft deleting the token from the database
    const payload = jwt.decode(refreshToken) as UserPayload;
    if (payload?.userId && req.user?.id === payload.userId) {
      await db.token.update({
        where: {
          id: refreshTokenId,
          userId: req.user.id,
        },
        data: {
          isRevoked: true,
        },
      });
    } else {
      return res.status(FORBIDDEN).json({ message: "Unauthorized, refreshToken is invalid" });
    }
    res.status(SUCCESS).json({ message: "Logged out successfully" });
  } catch (e) {
    res.status(SERVER_ERROR).json({ message: e });
  }
}