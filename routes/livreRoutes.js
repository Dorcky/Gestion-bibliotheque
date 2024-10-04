import express from 'express';
import * as livreController from '../controllers/livreController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, livreController.getAllLivres);
router.get('/:id', authMiddleware, livreController.getLivreById);
router.post('/', authMiddleware, livreController.createLivre);
router.put('/:id', authMiddleware, livreController.updateLivre);
router.delete('/:id', authMiddleware, livreController.deleteLivre);

export default router;