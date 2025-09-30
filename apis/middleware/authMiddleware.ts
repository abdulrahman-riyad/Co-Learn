import db from "../config/client.ts";
import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import { FORBIDDEN, SERVER_ERROR, UNAUTHORIZED } from "../types/constants.ts";
import type { ProtectedRequest, UserPayload } from "../types/types.ts";

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
      const secret = process.env.JWT_ACCESS_SECRET;

      if (!secret)
        return res
          .status(SERVER_ERROR)
          .json({ message: "jwt secret is not defined" });

      const payload = jwt.verify(token, secret, {
        algorithms: ["HS512"],
      }) as UserPayload;

      if (!payload.userId) {
        return res
          .status(FORBIDDEN)
          .json({ message: "Unauthorized, Token is invalid" });
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
        return res.status(UNAUTHORIZED).json({ message: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(UNAUTHORIZED).json({ message: "Token is expired" });
      }
      else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(FORBIDDEN).json({ message: "Token is invalid" });
      }
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
