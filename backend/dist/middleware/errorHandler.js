"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }
    // Mongoose validation errors
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        return res.status(400).json({
            message: 'Invalid data',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }
    // MongoDB duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
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
exports.errorHandler = errorHandler;
