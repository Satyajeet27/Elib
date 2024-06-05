import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  user: string;
}

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return next(createHttpError(401, "Authorization token is required"));
    }
    const parsedToken = token.split(" ")[1];
    const verifyUser = jwt.verify(parsedToken, config.jwt_secret_key as string);
    (req as AuthRequest).user = verifyUser.sub as string;
    next();
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Something went wrong in auth"));
  }
};

export default authentication;
