/***********************************/
/*** Import des module nécessaires */
const DB = require("../db.config");
const multer = require("multer");
const path = require("path");

const Role = DB.Role;
const User = DB.User;
const { Op } = DB.Sequelize;

/**************************************/
/*** Methode de Pagination */
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: roles } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, roles, totalPages, currentPage };
};
/**************************************/
/*** Routage de la ressource Role */

exports.getAllRoles = (req, res) => {
  console.log("query", req.query);
  const { page, size, nom } = req.query;
  var conditionNom = nom ? { nom: { [Op.like]: `%${nom}%` } } : null;

  const { limit, offset } = getPagination(page, size);
  console.log("conditionNom", conditionNom);

  Role.findAndCountAll({
    paranoid: true, // false les enregistrements supprimes  sont pris en compte et //  par defaut/true ne sont pas pris en compte
    where: conditionNom,
    limit,
    offset,
    order: [
      // Will escape title and validate DESC against a list of valid direction parameters
      ["nom", "ASC"],
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

exports.getRole = async (req, res) => {
  let roleId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!roleId) {
    return res.json(400).json({ message: "Missing Parameter" });
  }

  try {
    // Récupération du Role
    let role = await Role.findOne({
      where: { id: roleId },
      include: {
        model: User,
        as: "users",
        attributes: ["id", "pseudo", "email"],
        through: {
          attributes: [],
        },
      },
    });

    // Test si résultat
    if (role === null) {
      return res.status(404).json({ message: "This Role does not exist !" });
    }

    // Renvoi du Role trouvé
    return res.json({ data: role });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.addRole = async (req, res) => {
  let info = {
    nom: req.body.nom,
    description: req.body.description,
  };

  const { nom, description } = req.body;

  // Validation des données reçues
  if (!nom || !description) {
    return res.status(400).json({ message: "Missing Data" });
  }

  try {
    // Vérification si le coktail existe
    let role = await Role.findOne({ where: { nom: nom }, raw: true });
    if (role !== null) {
      return res
        .status(409)
        .json({ message: `The Role ${nom} already exists !` });
    }

    // Céation du Role
    role = await Role.create(info);
    return res.status(200).json({ data: role, message: "Role Ajouté" });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.updateRole = async (req, res) => {
  let roleId = parseInt(req.params.id);

  // console.log("FILE", req.file);

  console.log("roleId", req.params.id);
  console.log("Body nom", req.body.nom);
  // Vérification si le champ id est présent et cohérent
  if (!roleId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  try {
    // Recherche du Role et vérification
    let role = await Role.findOne({
      where: { id: roleId },
      // raw: true,
    });
    if (role === null) {
      return res.status(404).json({ message: "This Role does not exist !" });
    }
    let info = {
      nom: req.body.nom,
      description: req.body.description,
    };

    // Mise à jour du Role
    await Role.update(info, { where: { id: roleId } });
    return res.json({
      data: { id: roleId, ...info },
      message: "Role mis à jour",
    });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.untrashRole = (req, res) => {
  let roleId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!roleId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  Role.restore({ where: { id: roleId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.trashRole = (req, res) => {
  let roleId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!roleId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression du Role
  Role.destroy({ where: { id: roleId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.deleteRole = (req, res) => {
  let roleId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!roleId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression du Role
  Role.destroy({ where: { id: roleId }, force: true })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};
