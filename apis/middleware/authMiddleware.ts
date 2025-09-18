import db from "../config/client";
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { SERVER_ERROR, UNAUTHORIZED } from "../types/constants";
import { ProtectedRequest, UserPayload } from "../types/types";

export default async function authMiddleWareAuthentciation(
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET;
      if (!secret)
        return res
          .status(SERVER_ERROR)
          .json({ message: "jwt secret is not defined" });
      const payload = jwt.verify(token, secret, {
        algorithms: ["HS512"],
      }) as UserPayload;

      if (!payload.userId) {
        res
          .status(UNAUTHORIZED)
          .json({ message: "Unauthorized, jwt token is invalid" });
      }

      const user = await db.user.findUnique({
        where: {
          id: payload.userId,
        },
        omit: {
          password: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res
          .status(UNAUTHORIZED)
          .json({ message: "Unauthorized, User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      res
        .status(UNAUTHORIZED)
        .json({ message: "Unauthroized, token verficiation failed" });
    }
  } else {
    res
      .status(UNAUTHORIZED)
      .json({ message: "Unauthroized, no authorization provided" });
  }
}
