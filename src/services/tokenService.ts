import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";
import { User } from "../entity/User";

export class TokenService {
  constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );
    } catch (error) {
      const err = createHttpError(500, "Error while reading private key");
      throw err;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });

    return accessToken;
  }

  async generateRefreshToken(payload: JwtPayload, user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

    const newRefreshToken = await this.refreshTokenRepo.save({
      user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });

    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(newRefreshToken.id),
    });

    return refreshToken;
  }
}
