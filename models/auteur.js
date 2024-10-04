import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Auteur extends Model {
  static associate(models) {
    // Définir l'association ici
    Auteur.hasMany(models.Livre, { 
      foreignKey: 'auteurId', 
      as: 'Livres',
      onDelete: 'CASCADE'
    });
  }
}

Auteur.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: "Le nom de l'auteur ne peut pas être vide" }
    }
  },
  biographie: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Auteur',
  tableName: 'Auteurs',
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

export default Auteur;