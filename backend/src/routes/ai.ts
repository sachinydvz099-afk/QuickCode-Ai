import express from 'express';
import { generateCode, getAvailableProviders, testConnection } from '../controllers/aiController';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/ai/generate
// @desc    Generate code using AI
// @access  Private
router.post('/generate', auth, generateCode);

// @route   GET /api/ai/providers
// @desc    Get available AI providers
// @access  Private
router.get('/providers', auth, getAvailableProviders);

// @route   POST /api/ai/test
// @desc    Test AI provider connection
// @access  Private
router.post('/test', auth, testConnection);

export default router;
