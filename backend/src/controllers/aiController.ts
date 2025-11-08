import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import aiService from '../services/aiService';
import { Project } from '../models/Project';

export const generateCode = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, provider = 'auto', projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate code using AI
    const result = await aiService.generateCode(prompt, provider);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // If projectId is provided, add generated files to the project
    if (projectId && result.files && result.files.length > 0) {
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check if user owns the project or is a collaborator
      const userId = req.user?.id;
      const isOwner = project.owner.toString() === userId;
      const isCollaborator = project.collaborators.some(
        (collab) => collab.toString() === userId
      );

      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ error: 'Not authorized to modify this project' });
      }

      // Add generated files to project
      for (const file of result.files) {
        // Check if file already exists
        const existingFileIndex = project.files.findIndex(f => f.name === file.name);
        
        if (existingFileIndex !== -1) {
          // Update existing file
          project.files[existingFileIndex].content = file.content;
          project.files[existingFileIndex].lastModified = new Date();
        } else {
          // Add new file
          project.files.push({
            name: file.name,
            content: file.content,
            lastModified: new Date(),
          });
        }
      }

      await project.save();
    }

    res.json({
      success: true,
      generatedCode: result.code,
      files: result.files,
      provider: result.provider,
      filesAdded: projectId ? result.files?.length : 0,
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate code' 
    });
  }
};

export const getAvailableProviders = async (req: AuthRequest, res: Response) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({ 
      providers,
      count: providers.length,
      configured: providers.length > 0
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ 
      error: 'Failed to get available providers' 
    });
  }
};

export const testConnection = async (req: AuthRequest, res: Response) => {
  try {
    const { provider = 'auto' } = req.body;
    
    const result = await aiService.generateCode(
      'Generate a simple "Hello World" function in JavaScript',
      provider
    );

    res.json({
      success: result.success,
      provider: result.provider,
      message: result.success 
        ? `Successfully connected to ${result.provider}` 
        : result.error,
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed' 
    });
  }
};
