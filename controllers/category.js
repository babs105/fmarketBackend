/***********************************/
/*** Import des module nécessaires */
const DB = require("../db.config");
const multer = require("multer");
const path = require("path");

const Category = DB.Category;
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
  const { count: totalItems, rows: categories } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, categories, totalPages, currentPage };
};
/**************************************/
/*** Routage de la ressource Category */

exports.getAllCategoriesPage = (req, res) => {
  console.log("query", req.query);
  const { page, size, nom } = req.query;
  var conditionNom = nom ? { nom: { [Op.like]: `%${nom}%` } } : null;

  const { limit, offset } = getPagination(page, size);
  console.log("conditionNom", conditionNom);

  Category.findAndCountAll({
    paranoid: false, // false les enregistrements supprimes  sont pris en compte et //  par defaut/true ne sont pas pris en compte
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
exports.getAllCategories = (req, res) => {
  Category.findAll({
    paranoid: true, //true ils ne seront pas  affiches  en softdelete // false ils seront afficher mais sans contenue
    order: [
      // Will escape title and validate DESC against a list of valid direction parameters
      ["nom", "ASC"],
    ],
  })
    .then((response) => {
      console.log("data", response);
      return res.status(200).json({ data: response });
    })
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.getCategory = async (req, res) => {
  let categoryId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!categoryId) {
    return res.json(400).json({ message: "Missing Parameter" });
  }

  try {
    // Récupération du Category
    let category = await Category.findOne({
      where: { id: categoryId },
      // include: { model: User, attributes: ["id", "pseudo", "email"] },
    });

    // Test si résultat
    if (category === null) {
      return res
        .status(404)
        .json({ message: "This Category does not exist !" });
    }

    // Renvoi du Category trouvé
    return res.json({ data: category });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.addCategory = async (req, res) => {
  let info = {
    nom: req.body.nom,
    description: req.body.description,
  };

  const { nom, description } = req.body;

  // Validation des données reçues
  if (!nom || !description) {
    return res
      .status(400)
      .json({ message: "Données de la requete incorecttes" });
  }

  try {
    // Vérification si le coktail existe
    let category = await Category.findOne({ where: { nom: nom }, raw: true });
    if (category !== null) {
      return res
        .status(409)
        .json({ message: `La Categorie : ${nom} Existe Deja !` });
    }

    // Céation du Category
    category = await Category.create(info);
    return res.json({ message: "Categorie Creee", data: category });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.updateCategory = async (req, res) => {
  let categoryId = parseInt(req.params.id);

  // console.log("FILE", req.file);

  console.log("CategoryId", req.params.id);
  console.log("Body nom", req.body.nom);
  // Vérification si le champ id est présent et cohérent
  if (!categoryId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  try {
    // Recherche du Category et vérification
    let category = await Category.findOne({
      where: { id: categoryId },
      raw: true,
    });
    if (category === null) {
      return res
        .status(404)
        .json({ message: "Cette  Categorie n'existe pas !" });
    }
    let info = {
      nom: req.body.nom,
      description: req.body.description,
    };

    // Mise à jour du Category
    await Category.update(info, { where: { id: categoryId } });
    return res.json({ message: "Categorie Mise a jour " });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.untrashCategory = (req, res) => {
  let categoryId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!categoryId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  Category.restore({ where: { id: categoryId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.trashCategory = (req, res) => {
  let categoryId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!categoryId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression du Category
  Category.destroy({ where: { id: categoryId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.deleteCategory = (req, res) => {
  let categoryId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!categoryId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression du Category
  Category.destroy({ where: { id: categoryId }, force: true })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};
// 8. Upload Image Controller
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// exports.upload = multer({
//   storage: storage,
//   limits: { fileSize: "1000000" },
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const mimeType = fileTypes.test(file.mimetype);
//     const extname = fileTypes.test(path.extname(file.originalname));

//     if (mimeType && extname) {
//       return cb(null, true);
//     }
//     cb("Give proper files formate to upload");
//   },
// }).single("image");
