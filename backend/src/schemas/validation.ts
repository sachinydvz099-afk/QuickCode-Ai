import { z } from 'zod';

// Project schemas
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Project name is required')
      .max(100, 'Project name is too long'),
    description: z.string()
      .max(500, 'Description is too long')
      .optional(),
  })
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required')
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Project name is required')
      .max(100, 'Project name is too long')
      .optional(),
    description: z.string()
      .max(500, 'Description is too long')
      .optional(),
    collaborators: z.array(z.string())
      .optional()
  })
});

// File schemas
export const createFileSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required')
  }),
  body: z.object({
    fileName: z.string()
      .min(1, 'File name is required')
      .max(255, 'File name is too long')
      .regex(/^[\w\-. ]+$/, 'Invalid file name format')
  })
});

export const updateFileSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    fileName: z.string().min(1, 'File name is required')
  }),
  body: z.object({
    content: z.string()
      .max(1000000, 'File content is too large') // 1MB limit
  })
});

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username is too long'),
    email: z.string()
      .email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address'),
    password: z.string()
      .min(1, 'Password is required')
  })
});