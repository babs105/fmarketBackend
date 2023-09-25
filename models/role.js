/************************************/
/*** Import des modules nécessaires */
const { DataTypes } = require("sequelize");

/*******************************/
/*** Définition du modèle Role */
module.exports = (sequelize) => {
  return (Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING(100),
        defaultValue: "USER",
        allowNull: false,
      },
      // price: {
      //   type: DataTypes.INTEGER(15),
      //   allowNull: false,
      // },
      description: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
      },
      // recette: {
      //   type: DataTypes.TEXT,
      //   defaultValue: "",
      //   allowNull: false,
      // },
    },
    { paranoid: true }
  )); // Ici pour faire du softDelete
};

/****************************************/
/*** Ancienne Synchronisation du modèle */
// Role.sync()
// Role.sync({force: true})
// Role.sync({alter: true})
