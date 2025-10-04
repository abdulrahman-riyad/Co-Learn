import { Request, Response } from "express";
import prisma from "../../config/client.ts";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
  ROLES,
  CREATED,
} from "../../types/constants";
import { ProtectedRequest } from "../../types/types";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

// Get all classrooms
export const GetAllClassrooms = async function (req: Request, res: Response) {
  try {
    const classrooms = await prisma.classroom.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(SUCCESS).json({
      classrooms,
    });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to get classrooms",
    });
  }
};

// Get specific classroom by ID
export const GetClassroomById = async function (req: Request, res: Response) {
  try {
    const id = req.params.id;
    const classroom = await prisma.classroom.findUnique({
      where: { id: id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!classroom) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Classroom not found",
      });
    }

    res.status(SUCCESS).json({ classroom });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to get classroom",
    });
  }
};

// Get all classrooms user is enrolled in
export const GetUserClassrooms = async function (
  req: ProtectedRequest,
  res: Response
) {
  try {
    const user = req.user;
    const folderId = (req.query.folderId as string) || undefined;
    const isOwner = req.query.isOwner ? true : false;
    if (!user) {
      return res.status(BAD_REQUEST).json({
        message: "User not found in request",
      });
    }

    const enrollments = await prisma.usersFoldersClassrooms.findMany({
      where: {
        userId: user.id,
        folderId: folderId,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            description: true,
            avatar: true,
            cover: true,
            isPrivate: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        role: true,
      },
    });

    const classrooms = enrollments.map((e) => {
      return {
        ...e.classroom,
        folderId: e.folderId,
        folderColor: e.folder.color,
        role: e.role.name,
      };
    });

    if (isOwner) {
      const ownedClassrooms = classrooms.filter((c) => c.ownerId === user.id);
      return res.status(SUCCESS).json({
        classrooms: ownedClassrooms,
      });
    }

    res.status(SUCCESS).json({
      classrooms,
    });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to get user classrooms",
    });
  }
};

// Get classrooms created by the user
export const GetCreatedClassrooms = async function (
  req: ProtectedRequest,
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(BAD_REQUEST).json({
        message: "User not found in request",
      });
    }

    const classrooms = await prisma.classroom.findMany({
      where: { ownerId: user.id },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(SUCCESS).json({
      classrooms,
    });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to get created classrooms",
    });
  }
};

// Create a new classroom
export const CreateClassroom = async function (
  req: ProtectedRequest,
  res: Response
) {
  try {
    const user = req.user;
    const parentDirectory =
      (req.query.parentFolder as string) ||
      req.cookies["parentFolder"] ||
      undefined;

    const { name, description, tags, avatar, cover, isPrivate } = req.body;

    if (!user || parentDirectory === undefined) {
      return res.status(BAD_REQUEST).json({
        message: "User not found in request or parent folder not specified",
      });
    }

    // Create classroom
    const classroom = await prisma.classroom.create({
      data: {
        name: name,
        description: description || null,
        ownerId: user.id,
        tags: tags || [],
        avatar: avatar || null,
        cover: cover || null,
        isPrivate: isPrivate,
        usersFoldersClassrooms: {
          create: {
            userId: user.id,
            folderId: parentDirectory,
            roleId: ROLES.TEACHER,
          },
        },
      },
    });

    res.status(CREATED).json({
      message: "Classroom created successfully",
      classroom,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(BAD_REQUEST).json({
          message: "Parent folder does not exist",
        });
      }

      return res.status(BAD_REQUEST).json({
        message: error.message,
      });
    }
    res.status(SERVER_ERROR).json({
      message: "Failed to create classroom",
    });
  }
};

// Join a classroom
export const JoinClassroom = async function (
  req: ProtectedRequest,
  res: Response
) {
  try {
    const user = req.user;
    const invitationToken = req.query.token as string;
    if (!user || !invitationToken) {
      return res.status(BAD_REQUEST).json({
        message: "User or invitation token not found in request",
      });
    }

    const { classroomId } = req.params;
    const parentFolderId = req.query.parentFolder as string;

    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("jwt secret is not defined");
    }

    const invitationPayload = jwt.verify(
      invitationToken,
      process.env.JWT_ACCESS_SECRET
    ) as {
      invitationId: string;
    };

    // Check if classroom exists, folder exists, and user is not enrolled already
    const [classroom, isFolderExists, existing] = await Promise.all([
      prisma.classroom.findUnique({
        where: { id: classroomId },
        select: {
          id: true,
        },
      }),
      parentFolderId
        ? prisma.folder.count({ where: { id: parentFolderId } })
        : Promise.resolve(null),
      prisma.usersFoldersClassrooms.count({
        where: {
          userId: user.id,
          classroomId: classroomId,
        },
      }),
    ]);

    if (!classroom || !isFolderExists) {
      return res.status(NOT_FOUND).json({
        message: "Classroom or folder not found",
      });
    } else if (existing) {
      return res.status(BAD_REQUEST).json({
        message: "Already enrolled in this classroom",
      });
    }

    // Enroll user
    await prisma
      .$transaction(async (tx) => {
        // validating the invitation is found
        const invitation = await tx.invitations.findUnique({
          where: {
            id: invitationPayload.invitationId,
          },
        });

        if (
          !invitation ||
          invitation.isRevoked ||
          invitation.classroomId !== classroomId
        ) {
          throw new Error("Invalid invitationId");
        }
        const updatedInvitation = await tx.invitations.update({
          where: {
            id: invitation.id,
            isRevoked: false,
            expiresAt: { gte: new Date() },
            OR: [
              { maxUses: null },
              { uses: { lt: invitation.maxUses ?? Infinity } },
            ],
          },
          data: {
            uses: { increment: 1 },
          },
        });
        if (!updatedInvitation) {
          throw new Error(
            "Invitation is either expired, revoked or reached the maximum limit of uses"
          );
        }

        await tx.usersFoldersClassrooms.create({
          data: {
            userId: user.id,
            classroomId: classroomId,
            folderId: parentFolderId,
            roleId: ROLES[(invitation.role as keyof typeof ROLES) || "STUDENT"],
          },
        });
      })
      .catch((e) => {
        return res.status(BAD_REQUEST).json({
          message: e.message || "Failed to join classroom",
        });
      });

    res.status(SUCCESS).json({
      message: "Successfully joined classroom",
      classroom,
    });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to join classroom",
    });
  }
};

// Leave a classroom
export const UnenrollFromClassroom = async function (
  req: ProtectedRequest,
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(BAD_REQUEST).json({
        message: "User not found in request",
      });
    }
    const { classroomId } = req.params;

    // Check enrollment
    const enrollment = await prisma.usersFoldersClassrooms.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: classroomId,
        },
      },
    });

    if (!enrollment) {
      return res.status(NOT_FOUND).json({
        message: "Not enrolled in this classroom",
      });
    }

    // Check if user is owner
    if (enrollment.roleId === ROLES.TEACHER) {
      return res.status(BAD_REQUEST).json({
        message: "Owner cannot leave their own classroom. Delete it instead.",
      });
    }

    // Remove enrollment
    await prisma.usersFoldersClassrooms.delete({
      where: {
        userId_folderId_classroomId: {
          userId: user.id,
          folderId: enrollment.folderId,
          classroomId: classroomId,
        },
      },
    });

    res.status(SUCCESS).json({
      message: "Successfully left classroom",
    });
  } catch (error) {
    
    res.status(SERVER_ERROR).json({
      message: "Failed to leave classroom",
    });
  }
};

// Update classroom
export const UpdateClassroom = async function (req: ProtectedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(BAD_REQUEST).json({
        message: "User not found in request",
      });
    }
    const { classroomId } = req.params;
    const { name, description, tags, avatar, cover, isPrivate } = req.body;

    // Update classroom
    const updatedClassroom = await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        ...(name && { classroomName: name }),
        ...(description !== undefined && { description }),
        ...(tags && { tags }),
        ...(avatar !== undefined && { avatar }),
        ...(cover !== undefined && { cover }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
    });

    res.json({
      message: "Classroom updated successfully",
      updatedClassroom,
    });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to update classroom",
    });
  }
};

// Delete classroom
export const DeleteClassroom = async function (req: ProtectedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(BAD_REQUEST).json({
        message: "User not found in request",
      });
    }
    const { classroomId } = req.params;

    await prisma.classroom.delete({
      where: { id: classroomId },
    });

    res.json({
      message: "Classroom deleted successfully",
    });
  } catch (error) {
    res.status(SERVER_ERROR).json({
      message: "Failed to delete classroom",
    });
  }
};
