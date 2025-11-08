import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getProjectFiles = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user has access to the project
    if (project.owner.toString() !== req.user?.id && 
        !project.collaborators.map(id => id.toString()).includes(req.user?.id || '')) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(project.files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const createFile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, content = '' } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user has access to the project
    if (project.owner.toString() !== req.user?.id && 
        !project.collaborators.map(id => id.toString()).includes(req.user?.id || '')) {
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

    await project.save();
    res.json(project.files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const updateFile = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user has access to the project
    if (project.owner.toString() !== req.user?.id && 
        !project.collaborators.map(id => id.toString()).includes(req.user?.id || '')) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const fileIndex = project.files.findIndex(file => file.name === req.params.fileName);
    if (fileIndex === -1) {
      return res.status(404).json({ msg: 'File not found' });
    }

    project.files[fileIndex].content = content;
    project.files[fileIndex].lastModified = new Date();

    await project.save();
    res.json(project.files[fileIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user has access to the project
    if (project.owner.toString() !== req.user?.id && 
        !project.collaborators.map(id => id.toString()).includes(req.user?.id || '')) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const fileIndex = project.files.findIndex(file => file.name === req.params.fileName);
    if (fileIndex === -1) {
      return res.status(404).json({ msg: 'File not found' });
    }

    project.files.splice(fileIndex, 1);
    await project.save();
    res.json({ msg: 'File deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};