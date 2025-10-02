// Role: Defines all folder-related API endpoints and their HTTP methods

import { Router } from 'express';
import { 
  GetAllDirectories,
  GetRootFolder,
  GetFolderById,
  GetDirectoryItems,
  GetDirectoryClassrooms,
  GetChildDirectories,
  CreateDirectory,
  UpdateFolder,
  DeleteDirectory
} from '../../controllers/v1/folder.controller.js';
// Assuming authMiddleware exists - you'll need to update it to TypeScript
import authMiddleware  from '../../middleware/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// GET endpoints
router.get('/', GetAllDirectories);
router.get('/root', GetRootFolder);
router.get('/:id', GetFolderById);
router.get('/:id/children', GetDirectoryItems);
router.get('/:id/classrooms', GetDirectoryClassrooms);
router.get('/:id/directories', GetChildDirectories);

// POST endpoint
router.post('/', CreateDirectory);

// PUT endpoint  
router.put('/:id', UpdateFolder);

// DELETE endpoint
router.delete('/:id', DeleteDirectory);

export default router;