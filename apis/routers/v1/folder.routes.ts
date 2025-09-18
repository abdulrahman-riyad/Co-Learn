// Role: Defines all folder-related API endpoints and their HTTP methods

import { Router } from 'express';
import { FolderController } from '../../controllers/v1/folder.controller.js';
// Assuming authMiddleware exists - you'll need to update it to TypeScript
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// GET endpoints
router.get('/', FolderController.getAllDirectories);
router.get('/root', FolderController.getRootFolder);
router.get('/:id', FolderController.getFolderById);
router.get('/:id/children', FolderController.getDirectoryItems);
router.get('/:id/classrooms', FolderController.getDirectoryClassrooms);
router.get('/:id/directories', FolderController.getChildDirectories);

// POST endpoint
router.post('/', FolderController.createDirectory);

// PUT endpoint  
router.put('/:id', FolderController.updateFolder);

// DELETE endpoint
router.delete('/:id', FolderController.deleteDirectory);

export default router;