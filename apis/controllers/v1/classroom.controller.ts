// Role: Handles all classroom-related business logic - creating, joining, managing classrooms

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all public classrooms
export const GetAllClassrooms = async function (req: Request, res: Response) {
    try {
      const classrooms = await prisma.classroom.findMany({
        where: { isPrivate: false },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
export const GetClassroomById = async function (req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const classroom = await prisma.classroom.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              picture: true
            }
          },
          feedItems: {
            take: 10,
            orderBy: { createdAt: 'desc' }
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
            classroomId: id,
            userId: userId
          }
        });

        if (!hasAccess && classroom.ownerId !== userId) {
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
export const GetUserClassrooms = async function (req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const enrollments = await prisma.usersFoldersClassrooms.findMany({
        where: { userId: userId },
        include: {
          classroom: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
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
        folderId: e.folderId
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
export const GetCreatedClassrooms = async function (req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const classrooms = await prisma.classroom.findMany({
        where: { ownerId: userId },
        include: {
          _count: {
            select: {
              usersFoldersClassrooms: true,
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
export const CreateClassroom = async function (req: Request, res: Response) {
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
          classroomName: name,
          description: description || null,
          ownerId: userId,
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
            userId: userId, 
            parentId: null 
          }
        });

        if (rootFolder) {
          folderId = rootFolder.id;
        } else {
          const newRoot = await prisma.folder.create({
            data: {
              userId: userId,
              parentId: null,
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
          userId: userId,
          folderId: folderId,
          classroomId: classroom.id,
          roleId: teacherRole.id
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
export const JoinClassroom = async function (req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { classroomId } = req.params;
      const { parentFolder, uri, callback } = req.query as { parentFolder?: string, uri?: string, callback?: string };

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
          userId: userId,
          classroomId: classroomId
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
            userId: userId, 
            parentId: null 
          }
        });

        if (rootFolder) {
          folderId = rootFolder.id;
        } else {
          const newRoot = await prisma.folder.create({
            data: {
              userId: userId,
              parentId: null,
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
          userId: userId,
          folderId: folderId,
          classroomId: classroomId,
          roleId: studentRole.id
        }
      });

      res.json({ 
        success: true, 
        message: 'Successfully joined classroom',
        data: classroom,
        meta: {
          invitationUri: uri || null,
          callback: callback || null,
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to join classroom' 
      });
    }
  }

// Leave a classroom
export const UnenrollFromClassroom = async function (req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { classroomId } = req.params;

      // Check enrollment
      const enrollment = await prisma.usersFoldersClassrooms.findFirst({
        where: {
          userId: userId,
          classroomId: classroomId
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

      if (classroom?.ownerId === userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Owner cannot leave their own classroom. Delete it instead.' 
        });
      }

      // Remove enrollment
      await prisma.usersFoldersClassrooms.delete({
        where: {
          userId_folderId_classroomId: {
            userId: userId,
            folderId: enrollment.folderId,
            classroomId: classroomId
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
export const UpdateClassroom = async function (req: Request, res: Response) {
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

      if (classroom.ownerId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only owner can update classroom' 
        });
      }

      // Update classroom
      const updated = await prisma.classroom.update({
        where: { id: classroomId },
        data: {
          ...(name && { classroomName: name }),
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
export const DeleteClassroom = async function (req: Request, res: Response) {
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

      if (classroom.ownerId !== userId) {
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