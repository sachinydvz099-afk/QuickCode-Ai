import express from 'express';
import { check } from 'express-validator';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  addCollaborator,
  removeCollaborator,
  deleteProject
} from '../controllers/projectController';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  [
    auth,
    check('name', 'Name is required').not().isEmpty()
  ],
  createProject
);

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth, getProjects);

// @route   GET /api/projects/:projectId
// @desc    Get a project by ID
// @access  Private
router.get('/:projectId', auth, getProject);

// @route   PUT /api/projects/:projectId
// @desc    Update a project
// @access  Private
router.put(
  '/:projectId',
  [
    auth,
    check('name', 'Name is required').not().isEmpty()
  ],
  updateProject
);

// @route   POST /api/projects/:projectId/collaborators
// @desc    Add a collaborator to project
// @access  Private
router.post(
  '/:projectId/collaborators',
  [
    auth,
    check('collaboratorId', 'Collaborator ID is required').not().isEmpty()
  ],
  addCollaborator
);

// @route   DELETE /api/projects/:projectId/collaborators
// @desc    Remove a collaborator from project
// @access  Private
router.delete(
  '/:projectId/collaborators',
  [
    auth,
    check('collaboratorId', 'Collaborator ID is required').not().isEmpty()
  ],
  removeCollaborator
);

// @route   DELETE /api/projects/:projectId
// @desc    Delete a project
// @access  Private
router.delete('/:projectId', auth, deleteProject);

export default router;