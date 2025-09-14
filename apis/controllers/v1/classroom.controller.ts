// Path: co-learn/apis/controllers/classroom.controller.ts
// Role: Handles all classroom-related business logic - creating, joining, managing classrooms
// This is where teachers and students interact with course management

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClassroomController {
  // Get all public classrooms
  static async getAllClassrooms(req: Request, res: Response) {
    try {
      const classrooms = await prisma.classroom.findMany({
        where: { isPrivate: false },
        include: {
          owner: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true
            }
          }
        }
      });

      res.json({ 
        success: true, 
        data: classrooms,
        count: classrooms.length 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get classrooms' 
      });
    }
  }

  // Get specific classroom by ID
  static async getClassroomById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const classroom = await prisma.classroom.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              picture: true
            }
          },
          feed_items: {
            take: 10,
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!classroom) {
        return res.status(404).json({ 
          success: false, 
          message: 'Classroom not found' 
        });
      }

      // Check if private and user has access
      if (classroom.isPrivate) {
        const hasAccess = await prisma.usersFoldersClassrooms.findFirst({
          where: {
            classroom_id: id,
            user_id: userId
          }
        });

        if (!hasAccess && classroom.owner_id !== userId) {
          return res.status(403).json({ 
            success: false, 
            message: 'Access denied to private classroom' 
          });
        }
      }

      res.json({ success: true, data: classroom });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get classroom' 
      });
    }
  }

  // Get all classrooms user is enrolled in
  static async getUserClassrooms(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const enrollments = await prisma.usersFoldersClassrooms.findMany({
        where: { user_id: userId },
        include: {
          classroom: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true
                }
              }
            }
          },
          role: true
        }
      });

      const classrooms = enrollments.map(e => ({
        ...e.classroom,
        role: e.role,
        folder_id: e.folder_id
      }));

      res.json({ 
        success: true, 
        data: classrooms,
        count: classrooms.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get user classrooms' 
      });
    }
  }

  // Get classrooms created by the user
  static async getCreatedClassrooms(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const classrooms = await prisma.classroom.findMany({
        where: { owner_id: userId },
        include: {
          _count: {
            select: {
              users_folders_classrooms: true,
              activities: true
            }
          }
        }
      });

      res.json({ 
        success: true, 
        data: classrooms,
        count: classrooms.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get created classrooms' 
      });
    }
  }

  // Create a new classroom
  static async createClassroom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, description, tags, avatar, cover, isPrivate } = req.body;
      const { parentFolder } = req.query;

      if (!name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Classroom name is required' 
        });
      }

      // Get or create roles first
      let teacherRole = await prisma.role.findFirst({
        where: { name: 'teacher' }
      });

      if (!teacherRole) {
        // Create teacher role if it doesn't exist
        teacherRole = await prisma.role.create({
          data: { name: 'teacher' }
        });
      }

      // Create classroom
      const classroom = await prisma.classroom.create({
        data: {
          classroom_name: name,
          description: description || null,
          owner_id: userId,
          tags: tags || [],
          avatar: avatar || null,
          cover: cover || null,
          isPrivate: isPrivate || false
        }
      });

      // Add creator to classroom with teacher role
      let folderId = parentFolder as string;
      
      // If no folder specified, use or create root folder
      if (!folderId) {
        const rootFolder = await prisma.folder.findFirst({
          where: { 
            user_id: userId, 
            parent_id: null 
          }
        });

        if (rootFolder) {
          folderId = rootFolder.id;
        } else {
          const newRoot = await prisma.folder.create({
            data: {
              user_id: userId,
              parent_id: null,
              name: 'My Classrooms',
              color: '#3b82f6'
            }
          });
          folderId = newRoot.id;
        }
      }

      // Add to usersFoldersClassrooms (camelCase)
      await prisma.usersFoldersClassrooms.create({
        data: {
          user_id: userId,
          folder_id: folderId,
          classroom_id: classroom.id,
          role_id: teacherRole.id
        }
      });

      res.status(201).json({ 
        success: true, 
        message: 'Classroom created successfully',
        data: classroom 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create classroom' 
      });
    }
  }

  // Join a classroom
  static async joinClassroom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { classroomId } = req.params;
      const { parentFolder } = req.query;

      // Check if classroom exists
      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId }
      });

      if (!classroom) {
        return res.status(404).json({ 
          success: false, 
          message: 'Classroom not found' 
        });
      }

      // Check if already enrolled
      const existing = await prisma.usersFoldersClassrooms.findFirst({
        where: {
          user_id: userId,
          classroom_id: classroomId
        }
      });

      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already enrolled in this classroom' 
        });
      }

      // Get or create student role
      let studentRole = await prisma.role.findFirst({
        where: { name: 'student' }
      });

      if (!studentRole) {
        // Create student role if it doesn't exist
        studentRole = await prisma.role.create({
          data: { name: 'student' }
        });
      }

      // Get or create folder
      let folderId = parentFolder as string;
      if (!folderId) {
        const rootFolder = await prisma.folder.findFirst({
          where: { 
            user_id: userId, 
            parent_id: null 
          }
        });

        if (rootFolder) {
          folderId = rootFolder.id;
        } else {
          const newRoot = await prisma.folder.create({
            data: {
              user_id: userId,
              parent_id: null,
              name: 'My Courses',
              color: '#10b981'
            }
          });
          folderId = newRoot.id;
        }
      }

      // Enroll user
      await prisma.usersFoldersClassrooms.create({
        data: {
          user_id: userId,
          folder_id: folderId,
          classroom_id: classroomId,
          role_id: studentRole.id
        }
      });

      res.json({ 
        success: true, 
        message: 'Successfully joined classroom',
        data: classroom
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to join classroom' 
      });
    }
  }

  // Leave a classroom
  static async unenrollFromClassroom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { classroomId } = req.params;

      // Check enrollment
      const enrollment = await prisma.usersFoldersClassrooms.findFirst({
        where: {
          user_id: userId,
          classroom_id: classroomId
        }
      });

      if (!enrollment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Not enrolled in this classroom' 
        });
      }

      // Check if owner
      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId }
      });

      if (classroom?.owner_id === userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Owner cannot leave their own classroom. Delete it instead.' 
        });
      }

      // Remove enrollment
      await prisma.usersFoldersClassrooms.delete({
        where: {
          user_id_folder_id_classroom_id: {
            user_id: userId,
            folder_id: enrollment.folder_id,
            classroom_id: classroomId
          }
        }
      });

      res.json({ 
        success: true, 
        message: 'Successfully left classroom' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to leave classroom' 
      });
    }
  }

  // Update classroom
  static async updateClassroom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { classroomId } = req.params;
      const { name, description, tags, avatar, cover, isPrivate } = req.body;

      // Check ownership
      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId }
      });

      if (!classroom) {
        return res.status(404).json({ 
          success: false, 
          message: 'Classroom not found' 
        });
      }

      if (classroom.owner_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only owner can update classroom' 
        });
      }

      // Update classroom
      const updated = await prisma.classroom.update({
        where: { id: classroomId },
        data: {
          ...(name && { classroom_name: name }),
          ...(description !== undefined && { description }),
          ...(tags && { tags }),
          ...(avatar !== undefined && { avatar }),
          ...(cover !== undefined && { cover }),
          ...(isPrivate !== undefined && { isPrivate })
        }
      });

      res.json({ 
        success: true, 
        message: 'Classroom updated successfully',
        data: updated 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update classroom' 
      });
    }
  }

  // Delete classroom
  static async deleteClassroom(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { classroomId } = req.params;

      // Check ownership
      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId }
      });

      if (!classroom) {
        return res.status(404).json({ 
          success: false, 
          message: 'Classroom not found' 
        });
      }

      if (classroom.owner_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only owner can delete classroom' 
        });
      }

      // Delete classroom (cascade will handle related records)
      await prisma.classroom.delete({
        where: { id: classroomId }
      });

      res.json({ 
        success: true, 
        message: 'Classroom deleted successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete classroom' 
      });
    }
  }
}