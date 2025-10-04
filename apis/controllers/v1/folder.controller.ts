// Role: Handles all folder-related business logic and database operations

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all folders for the logged-in user
export const GetAllDirectories = async function (req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    const folders = await prisma.folder.findMany({
      where: { userId: userId }
    });

    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get folders' 
    });
  }
}

// Get a specific folder by ID
export const GetFolderById = async function (req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const folder = await prisma.folder.findFirst({
      where: { id, userId: userId }
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    res.json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get folder' 
    });
  }
}

// Get or create root folder for user
export const GetRootFolder = async function (req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    let rootFolder = await prisma.folder.findFirst({
      where: { 
        userId: userId, 
        parentId: null 
      }
    });

    // Create root folder if it doesn't exist
    if (!rootFolder) {
      rootFolder = await prisma.folder.create({
        data: {
          userId: userId,
          parentId: null,
          name: 'Root',
          color: '#3b82f6'
        }
      });
    }

    res.json({ success: true, data: rootFolder });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get root folder' 
    });
  }
}

// Get all items (subfolders and classrooms) in the folder
export const GetDirectoryItems = async function (req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Get subfolders
    const folders = await prisma.folder.findMany({
      where: { 
        parentId: id, 
        userId: userId 
      }
    });

    // Get classrooms in this folder
    const classrooms = await prisma.usersFoldersClassrooms.findMany({
      where: { 
        folderId: id, 
        userId: userId 
      },
      include: { 
        classroom: true 
      }
    });

    res.json({ 
      success: true, 
      data: { 
        folders, 
        classrooms: classrooms.map(c => c.classroom) 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get folder items' 
    });
  }
}

// Get only classrooms in a folder
export const GetDirectoryClassrooms = async function (req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const classrooms = await prisma.usersFoldersClassrooms.findMany({
      where: { 
        folderId: id, 
        userId: userId 
      },
      include: { 
        classroom: true 
      }
    });

    res.json({ 
      success: true, 
      data: classrooms.map(c => c.classroom) 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get classrooms' 
    });
  }
}

// Get only subfolders (no classrooms)
export const GetChildDirectories = async function (req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const folders = await prisma.folder.findMany({
      where: { 
        parentId: id, 
        userId: userId 
      }
    });

    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get subfolders' 
    });
  }
}

// Create a new folder
export const CreateDirectory = async function (req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { name, parentDirectory, color } = req.body;

    // If name is missing, provide a sensible default to align with docs sample
    const folderName = name && typeof name === 'string' && name.trim().length > 0 ? name.trim() : 'New Folder';

    const newFolder = await prisma.folder.create({
      data: {
        userId: userId,
        parentId: parentDirectory || null,
        name: folderName,
        color: color || '#3b82f6'
      }
    });

    res.status(201).json({ 
      success: true, 
      data: newFolder 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create folder' 
    });
  }
}

// Update a folder
export const UpdateFolder = async function (req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { name, color, parent_id } = req.body;

    // Check if folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: { id, userId: userId }
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(parent_id !== undefined && { parentId: parent_id })
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update folder' 
    });
  }
}

// Delete a folder (must be empty)
export const DeleteDirectory = async function (req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Check if folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: { id, userId: userId }
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    // Check if folder has contents
    const hasSubfolders = await prisma.folder.count({
      where: { parentId: id }
    });

    const hasClassrooms = await prisma.usersFoldersClassrooms.count({
      where: { folderId: id }
    });

    if (hasSubfolders > 0 || hasClassrooms > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete folder with contents' 
      });
    }

    await prisma.folder.delete({ where: { id } });

    res.json({ 
      success: true, 
      message: 'Folder deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete folder' 
    });
  }
}