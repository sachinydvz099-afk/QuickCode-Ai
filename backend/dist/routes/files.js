"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = require("../controllers/fileController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   GET /api/files/:projectId
// @desc    Get all files in a project
// @access  Private
router.get('/:projectId', auth_1.auth, fileController_1.getProjectFiles);
// @route   POST /api/files/:projectId
// @desc    Create a new file in a project
// @access  Private
router.post('/:projectId', auth_1.auth, fileController_1.createFile);
// @route   PUT /api/files/:projectId/:fileName
// @desc    Update a file's content
// @access  Private
router.put('/:projectId/:fileName', auth_1.auth, fileController_1.updateFile);
// @route   DELETE /api/files/:projectId/:fileName
// @desc    Delete a file
// @access  Private
router.delete('/:projectId/:fileName', auth_1.auth, fileController_1.deleteFile);
exports.default = router;
