import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';

dotenv.config(); // Charge les variables d'environnement

const PORT = process.env.PORT || 3000;

// Test de connexion à la base de données
sequelize.authenticate().then(() => {
  console.log('Connexion à la base de données établie avec succès');
  
  // Synchronisation de la base de données
  return sequelize.sync({ force: false });
}).then(() => {
  console.log('Base de données synchronisée');

  // Démarrage du serveur
  app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  });
}).catch(error => {
  console.error('Erreur lors de la synchronisation de la base de données ou du démarrage du serveur:', error);
});
