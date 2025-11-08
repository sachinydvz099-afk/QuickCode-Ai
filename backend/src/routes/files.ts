import express from 'express';
import { getProjectFiles, createFile, updateFile, deleteFile } from '../controllers/fileController';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/files/:projectId
// @desc    Get all files in a project
// @access  Private
router.get('/:projectId', auth, getProjectFiles);

// @route   POST /api/files/:projectId
// @desc    Create a new file in a project
// @access  Private
router.post('/:projectId', auth, createFile);

// @route   PUT /api/files/:projectId/:fileName
// @desc    Update a file's content
// @access  Private
router.put('/:projectId/:fileName', auth, updateFile);

// @route   DELETE /api/files/:projectId/:fileName
// @desc    Delete a file
// @access  Private
router.delete('/:projectId/:fileName', auth, deleteFile);

export default router;