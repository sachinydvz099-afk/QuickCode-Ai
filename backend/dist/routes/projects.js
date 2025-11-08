"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
    auth_1.auth,
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty()
], projectController_1.createProject);
// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth_1.auth, projectController_1.getProjects);
// @route   GET /api/projects/:projectId
// @desc    Get a project by ID
// @access  Private
router.get('/:projectId', auth_1.auth, projectController_1.getProject);
// @route   PUT /api/projects/:projectId
// @desc    Update a project
// @access  Private
router.put('/:projectId', [
    auth_1.auth,
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty()
], projectController_1.updateProject);
// @route   POST /api/projects/:projectId/collaborators
// @desc    Add a collaborator to project
// @access  Private
router.post('/:projectId/collaborators', [
    auth_1.auth,
    (0, express_validator_1.check)('collaboratorId', 'Collaborator ID is required').not().isEmpty()
], projectController_1.addCollaborator);
// @route   DELETE /api/projects/:projectId/collaborators
// @desc    Remove a collaborator from project
// @access  Private
router.delete('/:projectId/collaborators', [
    auth_1.auth,
    (0, express_validator_1.check)('collaboratorId', 'Collaborator ID is required').not().isEmpty()
], projectController_1.removeCollaborator);
// @route   DELETE /api/projects/:projectId
// @desc    Delete a project
// @access  Private
router.delete('/:projectId', auth_1.auth, projectController_1.deleteProject);
exports.default = router;
