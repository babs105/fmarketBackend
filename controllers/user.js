/***********************************/
/*** Import des module nécessaires */
const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");
const DB = require("../db.config");
const User = DB.User;
const Role = DB.Role;
const { Op, literal } = DB.Sequelize;
const sequelize = DB.sequelize;

/**************************************/
/*** Methode de Pagination */
const getPagination = (page, size) => {
  const limit = size ? +size : 4;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, users, totalPages, currentPage };
};
/**********************************/
/*** Routage de la ressource User */
exports.getAllUserPage = (req, res) => {
  console.log("query", req.query);
  const { page, size, prenom } = req.query;
  var conditionprenom = prenom
    ? { prenom: { [Op.like]: `%${prenom}%` } }
    : null;

  const { limit, offset } = getPagination(page, size);
  console.log("filter prenom", conditionprenom);

  User.findAndCountAll({
    paranoid: true,
    limit,
    offset,
    order: [
      // Will escape title and validate DESC against a list of valid direction parameters
      ["prenom", "ASC"],
    ],
  })
    .then((data) => {
      console.log("data", data);
      const response = getPagingData(data, page, limit);
      return res.status(200).json({ data: response });
    })
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};
exports.getAllUsers = (req, res) => {
  User.findAll()
    .then((users) => res.json({ data: users }))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.getOtherRoleUser = async (req, res) => {
  let userId = parseInt(req.params.id);
  // console.log(" iduser", userId);
  // // Vérification si le champ id est présent et cohérent
  // if (!userId) {
  //   return res.json(400).json({ message: "Missing Parameter" });
  // }
  if (!Number(userId))
    return res.status(404).json({ message: "This id user does not exist !" });
  try {
    //   // Récupération de l'utilisateur et vérification
    let user = await User.findOne({
      where: { id: userId },
      raw: true,
    });

    if (user === null) {
      return res.status(404).json({ message: "This user does not exist !" });
    }
    // const results = await sequelize.query(
    //   `SELECT * FROM Roles WHERE id NOT IN (
    //   SELECT role_id FROM user_role WHERE user_id = :userId
    // )`,
    //   {
    //     replacements: { userId },
    //     type: QueryTypes.SELECT,
    //     model: Role, // Modèle correspondant à la table "Roles"
    //     mapToModel: true,
    //     raw: false,
    //   }
    // );
    // let unassignedRoles = await Role.findAll({
    //   include: [
    //     {
    //       model: User,
    //       where: { id: userId }, // Filtrez par l'utilisateur spécifié
    //       required: false, // Utilisez un LEFT JOIN pour récupérer tous les rôles non assignés
    //     },
    //   ],
    //   where: { userId: null }, // Filtrez les rôles non assignés
    // });
    const unassignedRoles = await Role.findAll({
      where: {
        id: {
          [Op.notIn]: literal(
            `(SELECT role_id FROM user_role WHERE user_id = ${userId})`
          ),
        },
      },
    });
    return res.status(200).json({ data: unassignedRoles });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};
exports.getUser = async (req, res) => {
  let userId = parseInt(req.params.id);
  console.log(" iduser", userId);
  // Vérification si le champ id est présent et cohérent
  if (!userId) {
    return res.json(400).json({ message: "Missing Parameter" });
  }

  try {
    // Récupération de l'utilisateur et vérification
    let user = await User.findOne({
      where: { id: userId },
      include: {
        model: Role,
        as: "roles",
        attributes: ["id", "nom", "description"],
        through: {
          attributes: [],
        },
      },
    });
    if (user === null) {
      return res.status(404).json({ message: "This user does not exist !" });
    }

    return res.status(200).json({ data: user });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.assignRoleToUser = async (req, res) => {
  const { roleId, userId } = req.body;
  // let userId = parseInt(req.params.userId);
  // let roleId = parseInt(req.params.roleId);

  console.log("body", req.body);
  // Validation des données reçues
  if (!roleId || !userId) {
    return res.status(400).json({ message: "Missing Data" });
  }

  try {
    // Vérification si l'utilisateur existe déjà
    const user = await User.findOne({
      where: { id: userId },
      include: {
        model: Role,
        as: "roles",
        attributes: ["id", "nom", "description"],
        through: {
          attributes: [],
        },
      },

      //   raw: true,
    });

    if (user === null) {
      return res
        .status(401)
        .json({ message: "This account does not exists !" });
    }
    console.log("USER", user);

    const role = await Role.findOne({
      where: { id: parseInt(roleId) },
      // raw: true,
    });
    if (role === null) {
      return res.status(401).json({ message: "This Role does not exists !" });
    }
    console.log("ROLE", role);
    // Céation de l'utilisateur

    let userc = await user.addRole(role.id);
    return res.json({ message: `User as role ${role.prenom}`, data: userc });
  } catch (err) {
    console.log("erreur", err);
    // if (err.name == "SequelizeDatabaseError") {
    //   res.status(500).json({ message: "Database Error", error: err });
    // }
    res.status(500).json({ message: "Database Error", error: err });
  }
};
exports.unassignRoleToUser = async (req, res) => {
  const { roleId, userId } = req.body;

  // Validation des données reçues
  if (!roleId || !userId) {
    return res.status(400).json({ message: "Missing Data" });
  }

  try {
    // Vérification si l'utilisateur existe déjà
    const user = await User.findOne({ where: { id: userId } });
    if (user === null) {
      return res
        .status(401)
        .json({ message: "This account does not exists !" });
    }
    const role = await Role.findOne({ where: { id: roleId } });
    if (role === null) {
      return res.status(401).json({ message: "This Role does not exists !" });
    }
    // Céation de l'utilisateur
    // let userc = await User.create(req.body);
    let userc = await user.removeRole(role.id);

    return res.json({ message: "Role Retirer", data: user });
  } catch (err) {
    // if (err.name == "SequelizeDatabaseError") {
    //   res.status(500).json({ message: "Database Error", error: err });
    // }
    res.status(500).json({ message: "Error data base", error: err });
  }
};

exports.updateUser = async (req, res) => {
  let userId = parseInt(req.params.id);
  const { prenom, nom, email } = req.body;
  // Vérification si le champ id est présent et cohérent
  if (!userId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  try {
    // Recherche de l'utilisateur et vérification
    let user = await User.findOne({ where: { id: userId }, raw: true });
    if (user === null) {
      return res.status(404).json({ message: "This user does not exist !" });
    }

    // Mise à jour de l'utilisateur
    if (req.body.password) {
      // Hacher le nouveau mot de passe
      const hash = await bcrypt.hash(
        req.body.password,
        parseInt(process.env.BCRYPT_SALT_ROUND)
      );
      req.body.password = hash;
    }
    console.log("update body", req.body);
    await User.update(req.body, { where: { id: userId } });
    return res.json({
      message: "User Mise a jour",
      data: { prenom: prenom, nom: nom, email: email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.untrashUser = (req, res) => {
  let userId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!userId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  User.restore({ where: { id: userId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.trashUser = (req, res) => {
  let userId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!userId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression de l'utilisateur
  User.destroy({ where: { id: userId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.deleteUser = (req, res) => {
  let userId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!userId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression de l'utilisateur
  User.destroy({ where: { id: userId }, force: true })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};
