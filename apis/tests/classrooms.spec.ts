// Role: Test suite for classroom API endpoints

import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Classroom API Tests', () => {
  let testUserId: string;
  let testClassroomId: string;
  let testFolderId: string;
  let teacherRoleId: number;

  before(async () => {
    // Get or create teacher role
    let teacherRole = await prisma.role.findFirst({
      where: { name: 'teacher' }
    });

    if (!teacherRole) {
      teacherRole = await prisma.role.create({
        data: { 
          name: 'teacher',
          description: 'Teacher role'
        }
      });
    }
    
    teacherRoleId = teacherRole.id;

    // Create test user (teacher)
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Teacher',
        lastName: 'Test',
        email: `teacher${Date.now()}@colearn.com`,
        password: hashedPassword,
        picture: null
      }
    });
    testUserId = user.id;

    // Create test folder
    const folder = await prisma.folder.create({
      data: {
        userId: testUserId,
        parentId: null,
        name: 'Test Courses',
        color: '#3b82f6'
      }
    });
    testFolderId = folder.id;
  });

  after(async () => {
    // Cleanup - use camelCase to match Prisma generated models
    await prisma.usersFoldersClassrooms.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.classroom.deleteMany({
      where: { ownerId: testUserId }
    });
    await prisma.folder.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  it('should create a classroom', async () => {
    const classroom = await prisma.classroom.create({
      data: {
        classroomName: 'Mathematics 101',
        description: 'Introduction to Calculus',
        ownerId: testUserId,
        tags: ['math', 'calculus'],
        isPrivate: false
      }
    });

    expect(classroom).to.have.property('id');
    expect(classroom.classroomName).to.equal('Mathematics 101');
    expect(classroom.ownerId).to.equal(testUserId);
    testClassroomId = classroom.id;
  });

  it('should enroll user in classroom', async () => {
    // Use camelCase to match Prisma generated models
    const enrollment = await prisma.usersFoldersClassrooms.create({
      data: {
        userId: testUserId,
        folderId: testFolderId,
        classroomId: testClassroomId,
        roleId: teacherRoleId
      }
    });

    expect(enrollment.userId).to.equal(testUserId);
    expect(enrollment.classroomId).to.equal(testClassroomId);
  });

  it('should get classroom by ID', async () => {
    const classroom = await prisma.classroom.findUnique({
      where: { id: testClassroomId }
    });

    expect(classroom).to.not.be.null;
    expect(classroom?.id).to.equal(testClassroomId);
  });

  it('should get all public classrooms', async () => {
    const classrooms = await prisma.classroom.findMany({
      where: { isPrivate: false }
    });

    expect(classrooms).to.be.an('array');
    expect(classrooms.length).to.be.at.least(1);
  });

  it('should update classroom', async () => {
    const updated = await prisma.classroom.update({
      where: { id: testClassroomId },
      data: {
        description: 'Updated description'
      }
    });

    expect(updated.description).to.equal('Updated description');
  });
});