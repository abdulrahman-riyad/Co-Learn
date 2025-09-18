// Role: Defines all classroom API endpoints and maps them to controller functions

import { Router } from 'express';
import { ClassroomController } from '../../controllers/v1/classroom.controller.js';
// Import your existing auth middleware 
import { authMiddleware } from '../../middleware/authMiddleware.js';

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