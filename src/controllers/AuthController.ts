import { Request, Response } from "express";

class AuthController {
  register(req: Request, res: Response) {
    res.status(201).json({
      message: "Registered",
    });
  }
}

export default AuthController;
