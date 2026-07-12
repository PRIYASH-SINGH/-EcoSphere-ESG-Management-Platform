import { Request, Response, NextFunction } from "express";

/**
 * Global error handler — catches all unhandled errors from route handlers.
 * Returns a consistent JSON error response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const statusCode = (err as any).statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server error" : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Helper to create errors with HTTP status codes.
 */
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}
