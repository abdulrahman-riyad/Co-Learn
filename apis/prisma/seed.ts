// Path: co-learn/apis/prisma/seed.ts
// Role: Seeds initial data into the database (roles, permissions, test users)
// Run this once to set up your database with required data

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create roles
  console.log('Creating roles...');
  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    update: {},
    create: {
      name: 'student',
      description: 'Student role with basic permissions'
    }
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' },
    update: {},
    create: {
      name: 'teacher',
      description: 'Teacher role with classroom management permissions'
    }
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full permissions'
    }
  });

  console.log('Roles created');

  // Create test users (optional - for development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating test users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Test teacher
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@colearn.com' },
      update: {},
      create: {
        firstname: 'Ahmed',
        lastname: 'Hassan',
        email: 'teacher@colearn.com',
        password: hashedPassword,
        picture: null
      }
    });

    // Test student
    const student = await prisma.user.upsert({
      where: { email: 'student@colearn.com' },
      update: {},
      create: {
        firstname: 'Fatima',
        lastname: 'Ali',
        email: 'student@colearn.com',
        password: hashedPassword,
        picture: null
      }
    });

    console.log('Test users created');
    console.log('   Teacher: teacher@colearn.com / password123');
    console.log('   Student: student@colearn.com / password123');

    // Create sample classroom
    const classroom = await prisma.classroom.create({
      data: {
        classroom_name: 'Mathematics 101',
        description: 'Introduction to Calculus and Linear Algebra',
        owner_id: teacher.id,
        tags: ['mathematics', 'calculus', 'algebra'],
        isPrivate: false
      }
    });

    // Create folders for users
    const teacherFolder = await prisma.folder.create({
      data: {
        user_id: teacher.id,
        parent_id: null,
        name: 'My Teaching',
        color: '#8b5cf6'
      }
    });

    const studentFolder = await prisma.folder.create({
      data: {
        user_id: student.id,
        parent_id: null,
        name: 'My Courses',
        color: '#10b981'
      }
    });

    // Enroll teacher as owner - using camelCase for relation table
    await prisma.usersFoldersClassrooms.create({
      data: {
        user_id: teacher.id,
        folder_id: teacherFolder.id,
        classroom_id: classroom.id,
        role_id: teacherRole.id
      }
    });

    // Enroll student - using camelCase for relation table
    await prisma.usersFoldersClassrooms.create({
      data: {
        user_id: student.id,
        folder_id: studentFolder.id,
        classroom_id: classroom.id,
        role_id: studentRole.id
      }
    });

    console.log('Sample classroom created and users enrolled');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });