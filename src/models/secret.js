const { DataTypes } = require('sequelize');//sql
const sequelize = require('../config/database');//kapcsolat 

const Secret = sequelize.define('secret', {
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  secretText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  remainingViews: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Secret;
