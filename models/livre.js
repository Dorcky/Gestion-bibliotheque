import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Livre = sequelize.define('Livre', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
    },
  },
  auteurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  annee: {
    type: DataTypes.INTEGER,
    validate: {
      isInt: true,
      min: 1000,
      max: 9999,
    },
  },
  genre: {
    type: DataTypes.STRING(100),
  },
});

export default Livre;