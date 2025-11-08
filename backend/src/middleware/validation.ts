import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = async (
  schema: z.ZodObject<any>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return next(error);
  }
};

// Request validation schemas
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    collaborators: z.array(z.string()).optional(),
  }),
});

export const fileSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
    fileName: z.string().min(1),
  }),
  body: z.object({
    content: z.string().optional(),
  }),
});