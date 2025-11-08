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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.updateFile = exports.createFile = exports.getProjectFiles = void 0;
const Project_1 = require("../models/Project");
const getProjectFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user has access to the project
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
            !project.collaborators.map(id => id.toString()).includes(((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '')) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        res.json(project.files);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.getProjectFiles = getProjectFiles;
const createFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { name, content = '' } = req.body;
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user has access to the project
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
            !project.collaborators.map(id => id.toString()).includes(((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '')) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        // Check if file already exists
        if (project.files.some(file => file.name === name)) {
            return res.status(400).json({ msg: 'File already exists' });
        }
        project.files.push({
            name,
            content,
            lastModified: new Date()
        });
        yield project.save();
        res.json(project.files);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.createFile = createFile;
const updateFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { content } = req.body;
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user has access to the project
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
            !project.collaborators.map(id => id.toString()).includes(((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '')) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        const fileIndex = project.files.findIndex(file => file.name === req.params.fileName);
        if (fileIndex === -1) {
            return res.status(404).json({ msg: 'File not found' });
        }
        project.files[fileIndex].content = content;
        project.files[fileIndex].lastModified = new Date();
        yield project.save();
        res.json(project.files[fileIndex]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.updateFile = updateFile;
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const project = yield Project_1.Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // Check if user has access to the project
        if (project.owner.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
            !project.collaborators.map(id => id.toString()).includes(((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || '')) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        const fileIndex = project.files.findIndex(file => file.name === req.params.fileName);
        if (fileIndex === -1) {
            return res.status(404).json({ msg: 'File not found' });
        }
        project.files.splice(fileIndex, 1);
        yield project.save();
        res.json({ msg: 'File deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.deleteFile = deleteFile;
