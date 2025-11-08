"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
});
exports.validateRequest = validateRequest;
// Request validation schemas
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Project name is required').max(100),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().optional(),
        collaborators: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.fileSchema = zod_1.z.object({
    params: zod_1.z.object({
        projectId: zod_1.z.string().min(1),
        fileName: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        content: zod_1.z.string().optional(),
    }),
});
