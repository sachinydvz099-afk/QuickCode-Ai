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
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    try {
        // Check if user exists
        let user = yield User_1.User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        // Create new user
        user = new User_1.User({
            username,
            email,
            password
        });
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(password, salt);
        // Save user
        yield user.save();
        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };
        // Sign token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '24h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Check password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };
        // Sign token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '24h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.login = login;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.getMe = getMe;
