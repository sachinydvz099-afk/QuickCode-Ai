import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import mongoose from 'mongoose';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user?.id,
      collaborators: [],
      files: []
    });

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user?.id },
        { collaborators: req.user?.id }
      ]
    }).populate('owner', 'username email')
      .populate('collaborators', 'username email');
    
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email');

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user has access to the project
    if (project.owner.toString() !== req.user?.id && 
        !project.collaborators.some(id => id.toString() === req.user?.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const addCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const { collaboratorId } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Check if collaborator is already added
    if (project.collaborators.includes(new mongoose.Types.ObjectId(collaboratorId))) {
      return res.status(400).json({ msg: 'User is already a collaborator' });
    }

    project.collaborators.push(new mongoose.Types.ObjectId(collaboratorId));
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email');

    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const removeCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const { collaboratorId } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    project.collaborators = project.collaborators.filter(
      id => id.toString() !== collaboratorId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email');

    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};