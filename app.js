// Importation des modules nécessaires
import express from 'express';
import cors from 'cors';
import livreRoutes from './routes/livreRoutes.js';
import auteurRoutes from './routes/auteurRoutes.js';
import utilisateurRoutes from './routes/utilisateurRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Création de l'application Express
const app = express();

// Activation du middleware CORS pour permettre les requêtes cross-origin
app.use(cors());

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Configuration des routes pour les différentes ressources
app.use('/api/livres', livreRoutes);      // Routes pour les livres
app.use('/api/auteurs', auteurRoutes);    // Routes pour les auteurs
app.use('/api/utilisateurs', utilisateurRoutes); // Routes pour les utilisateurs

// Middleware de gestion globale des erreurs
app.use(errorHandler);

// Exportation de l'application pour pouvoir l'utiliser dans d'autres fichiers
export default app;