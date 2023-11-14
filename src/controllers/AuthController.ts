import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { RegisterUser } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator/src/validation-result";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { TokenService } from "../services/tokenService";

class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
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
      });

      this.logger.info("user has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      // access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persisting refresh token;
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

      const newRefreshToken = await refreshTokenRepo.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
        jwtid: String(newRefreshToken.id),
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
}

export default AuthController;
