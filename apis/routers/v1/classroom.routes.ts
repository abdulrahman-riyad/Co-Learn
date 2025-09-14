// Path: co-learn/apis/routers/classroom.routes.ts
// Role: Defines all classroom API endpoints and maps them to controller functions
// This file sets up the URL structure for classroom operations

import { Router } from 'express';
import { ClassroomController } from '../controllers/classroom.controller';
// Import your existing auth middleware
const { authMiddleware } = require('../middleware/authMiddleware');

const router = Router();

// Public routes (no auth required)
router.get('/', ClassroomController.getAllClassrooms);

// Protected routes (require authentication)
router.use(authMiddleware);

// GET endpoints
router.get('/all', ClassroomController.getUserClassrooms);
router.get('/created', ClassroomController.getCreatedClassrooms);
router.get('/unenroll/:classroomId', ClassroomController.unenrollFromClassroom);
router.get('/:id', ClassroomController.getClassroomById);

// POST endpoints
router.post('/', ClassroomController.createClassroom);
router.post('/join/:classroomId', ClassroomController.joinClassroom);

// PUT endpoint
router.put('/:classroomId', ClassroomController.updateClassroom);

// DELETE endpoint
router.delete('/:classroomId', ClassroomController.deleteClassroom);

export default router;