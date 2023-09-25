/************************************/
/*** Import des modules nécessaires */
const { DataTypes } = require("sequelize");

/*******************************/
/*** Définition du modèle Category */
module.exports = (sequelize) => {
  return (Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      // image: {
      //   type: DataTypes.STRING,
      // },

      // user_id: {
      //   type: DataTypes.INTEGER(10),
      //   allowNull: false,
      // },
      nom: {
        type: DataTypes.STRING(100),
        defaultValue: "",
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
// Category.sync()
// Category.sync({force: true})
// Category.sync({alter: true})
