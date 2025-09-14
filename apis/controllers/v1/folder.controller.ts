// Path: co-learn/apis/controllers/folder.controller.ts
// Role: Handles all folder-related business logic and database operations
// This controller manages the folder hierarchy system where users organize their classrooms

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FolderController {
  // Get all folders for the logged-in user
  static async getAllDirectories(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      const folders = await prisma.folder.findMany({
        where: { user_id: userId }
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
  static async getFolderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const folder = await prisma.folder.findFirst({
        where: { id, user_id: userId }
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
  static async getRootFolder(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      let rootFolder = await prisma.folder.findFirst({
        where: { 
          user_id: userId, 
          parent_id: null 
        }
      });

      // Create root folder if it doesn't exist
      if (!rootFolder) {
        rootFolder = await prisma.folder.create({
          data: {
            user_id: userId,
            parent_id: null,
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

  // Get all items (subfolders and classrooms) in a folder
  static async getDirectoryItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Get subfolders
      const folders = await prisma.folder.findMany({
        where: { 
          parent_id: id, 
          user_id: userId 
        }
      });

      // Get classrooms in this folder - using camelCase
      const classrooms = await prisma.usersFoldersClassrooms.findMany({
        where: { 
          folder_id: id, 
          user_id: userId 
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
  static async getDirectoryClassrooms(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const classrooms = await prisma.usersFoldersClassrooms.findMany({
        where: { 
          folder_id: id, 
          user_id: userId 
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
  static async getChildDirectories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const folders = await prisma.folder.findMany({
        where: { 
          parent_id: id, 
          user_id: userId 
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
  static async createDirectory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, parentDirectory, color } = req.body;

      if (!name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Folder name is required' 
        });
      }

      const newFolder = await prisma.folder.create({
        data: {
          user_id: userId,
          parent_id: parentDirectory || null,
          name,
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
  static async updateFolder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { name, color, parent_id } = req.body;

      // Check if folder exists and belongs to user
      const folder = await prisma.folder.findFirst({
        where: { id, user_id: userId }
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
          ...(parent_id !== undefined && { parent_id })
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
  static async deleteDirectory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check if folder exists and belongs to user
      const folder = await prisma.folder.findFirst({
        where: { id, user_id: userId }
      });

      if (!folder) {
        return res.status(404).json({ 
          success: false, 
          message: 'Folder not found' 
        });
      }

      // Check if folder has contents
      const hasSubfolders = await prisma.folder.count({
        where: { parent_id: id }
      });

      const hasClassrooms = await prisma.usersFoldersClassrooms.count({
        where: { folder_id: id }
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
}