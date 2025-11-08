"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    (0, express_validator_1.check)('username', 'Username is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], authController_1.register);
// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Password is required').exists()
], authController_1.login);
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth_1.auth, authController_1.getMe);
exports.default = router;
