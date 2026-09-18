import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[URIMAIYALAR SERVER ERROR]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message || err,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}
