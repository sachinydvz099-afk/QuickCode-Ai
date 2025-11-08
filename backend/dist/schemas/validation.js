"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.updateFileSchema = exports.createFileSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
// Project schemas
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string()
            .min(1, 'Project name is required')
            .max(100, 'Project name is too long'),
        description: zod_1.z.string()
            .max(500, 'Description is too long')
            .optional(),
    })
});
exports.updateProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Project ID is required')
    }),
    body: zod_1.z.object({
        name: zod_1.z.string()
            .min(1, 'Project name is required')
            .max(100, 'Project name is too long')
            .optional(),
        description: zod_1.z.string()
            .max(500, 'Description is too long')
            .optional(),
        collaborators: zod_1.z.array(zod_1.z.string())
            .optional()
    })
});
// File schemas
exports.createFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().min(1, 'Project ID is required')
    }),
    body: zod_1.z.object({
        fileName: zod_1.z.string()
            .min(1, 'File name is required')
            .max(255, 'File name is too long')
            .regex(/^[\w\-. ]+$/, 'Invalid file name format')
    })
});
exports.updateFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().min(1, 'Project ID is required'),
        fileName: zod_1.z.string().min(1, 'File name is required')
    }),
    body: zod_1.z.object({
        content: zod_1.z.string()
            .max(1000000, 'File content is too large') // 1MB limit
    })
});
// Auth schemas
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username is too long'),
        email: zod_1.z.string()
            .email('Invalid email address'),
        password: zod_1.z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string()
            .email('Invalid email address'),
        password: zod_1.z.string()
            .min(1, 'Password is required')
    })
});
