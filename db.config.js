// ******************* import des modules necessaires  ***********************
const { Sequelize } = require("sequelize");

// ******************* connexion  a la base donnees *************** *
let sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

/*** Mise en place des relations */
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require("./models/user")(sequelize);
db.Cocktail = require("./models/cocktail")(sequelize);
db.Category = require("./models/category")(sequelize);
db.Role = require("./models/role")(sequelize);

/*** relation User - Cocktail ***/
db.User.hasMany(db.Cocktail, { foreignKey: "user_id", onDelete: "RESTRICT" });
db.Cocktail.belongsTo(db.User, { as: "user", foreignKey: "user_id" });
/****************************************************/

/*** relation Category - Cocktail ************* */

db.Category.belongsToMany(db.Cocktail, {
  through: "category_cocktail",
  as: "products",
  foreignKey: "category_id",
});
db.Cocktail.belongsToMany(db.Category, {
  through: "category_cocktail",
  as: "categories",
  foreignKey: "cocktail_id",
});

/****************************************************/

/*** relation User - Role ************* */

db.User.belongsToMany(db.Role, {
  through: "user_role",
  as: "roles",
  foreignKey: "user_id",
});
db.Role.belongsToMany(db.User, {
  through: "user_role",
  as: "users",
  foreignKey: "role_id",
});

/****************************************************/

/*********************************/
/*** Synchronisation des modèles */
// sequelize.sync(err => {
//     console.log('Database Sync Error', err)
// })
db.sequelize.sync({ alter: true });

module.exports = db;
