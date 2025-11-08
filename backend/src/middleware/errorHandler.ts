import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Invalid data',
      errors: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // MongoDB duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(409).json({
      message: 'Duplicate value',
      error: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Default error
  return res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};