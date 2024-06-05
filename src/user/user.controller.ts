import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./user.model";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return next(createHttpError(400, "User already exist, please login"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "user account has been created",
      user: config.node_env === "development" && newUser,
    });
  } catch (error) {
    next(createHttpError(500, "Something went wrong in createUser Api"));
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }
    const userExist = await userModel.findOne({ email });
    if (!userExist) {
      return next(
        createHttpError(400, "User does not exist, please register yourself")
      );
    }
    const comparePassword = await bcrypt.compare(password, userExist.password);
    if (!comparePassword) {
      return next(createHttpError(400, "Invalid email or password"));
    }
    const token = jwt.sign(
      { sub: userExist.id },
      config.jwt_secret_key as string,
      { expiresIn: "1d" }
    );
    res.header("Authorization");
    return res.json({
      message: "Login successfull",
      token,
    });
  } catch (error) {
    next(createHttpError(500, "Something went wrong in login api"));
  }
};
