import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { AuthRequest, LoginUser, RegisterUser } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator/src/validation-result";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/tokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/credentialService";

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
      });

      this.logger.info("user has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      // access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      // refresh token
      const refreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
      );

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
      const refreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
      );

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

      res.status(200).json("Logged In");
    } catch (error) {
      return next(error);
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub));

    res.status(200).json({ ...user, password: undefined });
  }
}

export default AuthController;
