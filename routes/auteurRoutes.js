import express from 'express';
import * as auteurController from '../controllers/auteurController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, auteurController.getAllAuteurs);
router.get('/:id', authMiddleware, auteurController.getAuteurById);
router.post('/', authMiddleware, auteurController.createAuteur);
router.put('/:id', authMiddleware, auteurController.updateAuteur);
router.delete('/:id', authMiddleware, auteurController.deleteAuteur);

export default router;