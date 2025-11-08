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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Project_1 = require("../models/Project");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcode';
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // Clear existing data
            yield User_1.User.deleteMany({});
            yield Project_1.Project.deleteMany({});
            console.log('Cleared existing data');
            // Create admin user
            const hashedPassword = yield bcryptjs_1.default.hash('admin123', 10);
            const adminUser = yield User_1.User.create({
                username: 'admin',
                email: 'admin@quickcode.ai',
                password: hashedPassword
            });
            console.log('Created admin user');
            // Create sample project
            const sampleProject = yield Project_1.Project.create({
                name: 'Sample Project',
                description: 'A sample project to get you started',
                owner: adminUser._id,
                files: [
                    {
                        name: 'main.js',
                        content: '// Welcome to QuickCode!\nconsole.log("Hello, World!");',
                        lastModified: new Date()
                    },
                    {
                        name: 'index.html',
                        content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Welcome</title>\n</head>\n<body>\n  <h1>Welcome to QuickCode</h1>\n</body>\n</html>',
                        lastModified: new Date()
                    }
                ]
            });
            console.log('Created sample project');
            console.log('\nDatabase initialized successfully!');
            console.log('\nAdmin credentials:');
            console.log('Email: admin@quickcode.ai');
            console.log('Password: admin123');
        }
        catch (error) {
            console.error('Error initializing database:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
initializeDatabase();
