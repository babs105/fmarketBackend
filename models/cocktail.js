/************************************/
/*** Import des modules nécessaires */
const { DataTypes } = require("sequelize");

/*******************************/
/*** Définition du modèle Cocktail */
module.exports = (sequelize) => {
  return (Cocktail = sequelize.define(
    "Cocktail",
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      images: {
        // type: DataTypes.STRING,
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      user_id: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
      },
      nom: {
        type: DataTypes.STRING(100),
        defaultValue: "",
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER(15),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
      },
      recette: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
      },
    },
    { paranoid: true }
  )); // Ici pour faire du softDelete
};

/****************************************/
/*** Ancienne Synchronisation du modèle */
// Cocktail.sync()
// Cocktail.sync({force: true})
// Cocktail.sync({alter: true})
