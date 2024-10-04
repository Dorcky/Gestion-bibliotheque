import Livre from './livre.js';
import Auteur from './auteur.js';
import Utilisateur from './utilisateur.js';

Livre.belongsTo(Auteur, { foreignKey: 'auteurId' });
Auteur.hasMany(Livre, { foreignKey: 'auteurId' });

export { Livre, Auteur, Utilisateur };