// Role: Defines all classroom API endpoints and maps them to controller functions

import { Router } from 'express';
import { 
  GetAllClassrooms,
  GetClassroomById,
  GetUserClassrooms,
  GetCreatedClassrooms,
  CreateClassroom,
  JoinClassroom,
  UnenrollFromClassroom,
  UpdateClassroom,
  DeleteClassroom
} from '../../controllers/v1/classroom.controller.js';
// Import your existing auth middleware 
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// Public routes (no auth required)
router.get('/', GetAllClassrooms);

// Protected routes (require authentication)
router.use(authMiddleware);

// GET endpoints
router.get('/all', GetUserClassrooms);
router.get('/created', GetCreatedClassrooms);
router.get('/unenroll/:classroomId', UnenrollFromClassroom);
router.get('/:id', GetClassroomById);

// POST endpoints
router.post('/', CreateClassroom);
router.post('/join/:classroomId', JoinClassroom);

// PUT endpoint
router.put('/:classroomId', UpdateClassroom);

// DELETE endpoint
router.delete('/:classroomId', DeleteClassroom);

export default router;