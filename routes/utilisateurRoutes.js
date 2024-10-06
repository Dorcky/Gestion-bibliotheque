import express from 'express';
import * as utilisateurController from '../controllers/utilisateurController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Route d'inscription
router.post('/register', utilisateurController.register);

// Route de connexion
router.post('/login', utilisateurController.login);

// Route de mise à jour (authentifiée)
router.put('/:id', authMiddleware, utilisateurController.updateUser);

// Route de suppression (admin seulement)
router.delete('/:id', authMiddleware, adminMiddleware, utilisateurController.deleteUser);

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', authMiddleware, utilisateurController.getProfile);

export default router;