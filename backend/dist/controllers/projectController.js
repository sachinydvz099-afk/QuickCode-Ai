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
exports.deleteProject = exports.removeCollaborator = exports.addCollaborator = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const Project_1 = require("../models/Project");
const mongoose_1 = __importDefault(require("mongoose"));
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description } = req.body;
        const project = new Project_1.Project({
            name,
            description,
            owner: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            collaborators: [],
            files: []
        });
        yield project.save();
        res.json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.createProject = createProject;
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const projects = yield Project_1.Project.find({
            $or: [
                { owner: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                { collaborators: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }
            ]
        }).populate('owner', 'username email')
            .populate('collaborators', 'username email');
        res.json(projects);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.getProjects = getProjects;
const getProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const project = yield Project_1.Project.findById(req.params.projectId)
            .populate('owner', 'username email')
            .populate('collaborators', 'username email');
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user has access to the project
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
            !project.collaborators.some(id => { var _a; return id.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        res.json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.getProject = getProject;
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description } = req.body;
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user is the owner
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        project.name = name || project.name;
        project.description = description || project.description;
        yield project.save();
        res.json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.updateProject = updateProject;
const addCollaborator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { collaboratorId } = req.body;
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user is the owner
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        // Check if collaborator is already added
        if (project.collaborators.includes(new mongoose_1.default.Types.ObjectId(collaboratorId))) {
            return res.status(400).json({ msg: 'User is already a collaborator' });
        }
        project.collaborators.push(new mongoose_1.default.Types.ObjectId(collaboratorId));
        yield project.save();
        const updatedProject = yield Project_1.Project.findById(project._id)
            .populate('owner', 'username email')
            .populate('collaborators', 'username email');
        res.json(updatedProject);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.addCollaborator = addCollaborator;
const removeCollaborator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { collaboratorId } = req.body;
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user is the owner
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        project.collaborators = project.collaborators.filter(id => id.toString() !== collaboratorId);
        yield project.save();
        const updatedProject = yield Project_1.Project.findById(project._id)
            .populate('owner', 'username email')
            .populate('collaborators', 'username email');
        res.json(updatedProject);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.removeCollaborator = removeCollaborator;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user is the owner
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        yield project.deleteOne();
        res.json({ msg: 'Project deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.deleteProject = deleteProject;
