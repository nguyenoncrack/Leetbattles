import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/authService";
import { Unauthorized } from "../utils/errors";

export interface AuthedRequest extends Request {
  userId: string;
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return next(Unauthorized("Missing bearer token"));
  }
  try {
    const token = header.slice("Bearer ".length);
    const { sub } = verifyToken(token);
    (req as AuthedRequest).userId = sub;
    next();
  } catch {
    next(Unauthorized("Invalid or expired token"));
  }
}
