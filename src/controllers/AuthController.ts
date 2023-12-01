import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { AuthRequest, LoginUser, RegisterUser } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator/src/validation-result";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/tokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/credentialService";
import { Roles } from "../constants";

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {}

  async register(req: RegisterUser, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;
    this.logger.debug("Register request", {
      firstName,
      lastName,
      email,
      password: "",
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });

      this.logger.info("user has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(201).json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: LoginUser, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        const error = createHttpError(400, "Email Id or password is incorrect");
        return next(error);
      }

      const isPasswordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordMatch) {
        const error = createHttpError(400, "Email Id or password is incorrect");
        return next(error);
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      this.logger.info("User has been logged in", { id: user.id });
      res.json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub));

    res.status(200).json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth?.sub,
        role: req.auth?.role,
      };

      const user = await this.userService.findById(Number(req.auth?.sub));
      if (!user) {
        const error = createHttpError(
          400,
          "User with the token could not find",
        );
        return next(error);
      }

      const accessToken = this.tokenService.generateAccessToken(payload);
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.json({});
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info("Refresh token has been deleted", {
        id: req.auth.id,
      });
      this.logger.info("User has been logged out", {
        id: req.auth.sub,
      });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.json({});
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;
