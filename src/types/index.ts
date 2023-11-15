import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterUser extends Request {
  body: UserData;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginUser extends Request {
  body: LoginData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
  };
}
