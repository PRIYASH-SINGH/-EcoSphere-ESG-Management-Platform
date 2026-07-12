import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  private service = new AuthService();

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      const user = await this.service.signup(email, password, name);
      res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const user = await this.service.getProfile(userId);
      res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };
}
