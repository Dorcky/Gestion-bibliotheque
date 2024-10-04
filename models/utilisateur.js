
import bcrypt from 'bcrypt';
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Utilisateur extends Model {
  // Méthode pour comparer le mot de passe avec celui stocké dans la base de données
  comparePassword(motDePasse, motDePasseHache) {
    return bcrypt.compare(motDePasse, motDePasseHache);
  }
}

Utilisateur.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    motDePasse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'utilisateur',
    },
  },
  {
    sequelize,
    modelName: 'Utilisateur',
    hooks: {
      beforeCreate: async (utilisateur) => {
        if (utilisateur.motDePasse) {
          const salt = await bcrypt.genSalt(10);
          utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, salt);
        }
      },
      beforeUpdate: async (utilisateur) => {
        if (utilisateur.motDePasse && utilisateur.changed('motDePasse')) {
          const salt = await bcrypt.genSalt(10);
          utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, salt);
        }
      },
    },
  }
);

export default Utilisateur;
