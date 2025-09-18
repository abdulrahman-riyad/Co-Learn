// Role: Test suite for folder API endpoints using Mocha/Chai

import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // Import bcrypt for password hashing

const prisma = new PrismaClient();

describe('Folder API Tests', () => {
  let testUserId: string;
  let rootFolderId: string;

  before(async () => {
    // Setup: Create a test user with required password field
    const hashedPassword = await bcrypt.hash('testpassword123', 10); // Hash password
    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@colearn.com`,
        picture: null,
        password: hashedPassword // Include required password field
      }
    });
    testUserId = user.id;
  });

  after(async () => {
    // Cleanup: Delete test data
    await prisma.folder.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  it('should create a root folder', async () => {
    const folder = await prisma.folder.create({
      data: {
        userId: testUserId,
        parentId: null,
        name: 'Root',
        color: '#3b82f6'
      }
    });
    
    expect(folder).to.have.property('id');
    expect(folder.name).to.equal('Root');
    expect(folder.parentId).to.be.null;
    rootFolderId = folder.id;
  });

  it('should create a subfolder', async () => {
    const subfolder = await prisma.folder.create({
      data: {
        userId: testUserId,
        parentId: rootFolderId,
        name: 'Mathematics',
        color: '#10b981'
      }
    });
    
    expect(subfolder.parentId).to.equal(rootFolderId);
    expect(subfolder.name).to.equal('Mathematics');
  });

  it('should get all folders for a user', async () => {
    const folders = await prisma.folder.findMany({
      where: { userId: testUserId }
    });
    
    expect(folders).to.be.an('array');
    expect(folders.length).to.be.at.least(2);
  });
});