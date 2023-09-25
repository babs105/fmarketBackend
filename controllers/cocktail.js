/***********************************/
/*** Import des module nécessaires */
const DB = require("../db.config");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Cocktail = DB.Cocktail;
const User = DB.User;
const Category = DB.Category;
const { Op } = DB.Sequelize;

/**************************************/
/*** Methode de Pagination */
const getPagination = (page, size) => {
  const limit = size ? +size : 4;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: cocktails } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, cocktails, totalPages, currentPage };
};
/**************************************/
/*** Routage de la ressource Cocktail */

exports.getAllCocktails = (req, res) => {
  console.log("query", req.query);
  const { page, size, nom, price, category } = req.query;
  var conditionNom = nom ? { nom: { [Op.like]: `%${nom}%` } } : null;
  var conditionCategory = category
    ? { nom: { [Op.like]: `%${category}%` } }
    : null;
  // var conditionCategory = category
  //   ? {
  //       include: [
  //         {
  //           model: Category,

  //           where: { nom: category }, // Filtrez par l'ID de la catégorie
  //         },
  //       ],
  //     }
  //   : null;
  var conditionPrice = price
    ? {
        price: {
          [Op.between]: [
            parseInt(price.split(",")[0]),
            parseInt(price.split(",")[1]),
          ],
        },
      }
    : null;
  const { limit, offset } = getPagination(page, size);

  console.log("conditionNom", conditionNom);
  console.log("conditionCategory", conditionCategory);
  console.log("conditionPrice", conditionPrice);

  Cocktail.findAndCountAll({
    paranoid: true,
    where: {
      [Op.and]: [conditionNom, conditionPrice],
      // conditionCategory,
    },
    limit,
    offset,
    order: [["price", "ASC"]],
    include: [
      {
        model: Category,
        as: "categories",
        where: conditionCategory,
        attributes: ["id", "nom", "description"],
      },
    ],
    distinct: true,
  })
    .then((data) => {
      console.log("data", data);
      const response = getPagingData(data, page, limit);
      res.json({ data: response });
    })
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.getCocktail = async (req, res) => {
  let cocktailId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!cocktailId) {
    return res.json(400).json({ message: "Missing Parameter" });
  }

  try {
    // Récupération du cocktail
    let cocktail = await Cocktail.findOne({
      // paranoid: false,
      where: { id: cocktailId },
      include: [
        { model: User, as: "user", attributes: ["id", "prenom", "email"] },
        {
          model: Category,
          as: "categories",
          attributes: ["id", "nom", "description"],
        },
      ],
    });

    // Test si résultat
    if (cocktail === null) {
      return res
        .status(404)
        .json({ message: "This cocktail does not exist !" });
    }

    // Renvoi du Cocktail trouvé
    return res.json({ data: cocktail });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.addCocktail = async (req, res) => {
  // console.log("REQ", req);
  console.log("BODY", req.body);
  console.log("FILES", req.files);
  const pathFiles = [];
  // const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
    pathFiles.push(req.files[i].path);
  }
  console.log("name array", pathFiles);
  let info = {
    images: pathFiles,
    user_id: req.body.user_id,
    nom: req.body.nom,
    description: req.body.description,
    categories: req.body.categories,
    price: req.body.price,
  };
  // let info = {
  //   image: req?.file?.path,
  //   user_id: req.body.user_id,
  //   nom: req.body.nom,
  //   description: req.body.description,
  //   categories: req.body.categories,
  //   price: req.body.price,
  // };

  const { user_id, nom, description, price, categories } = req.body;

  // Validation des données reçues
  if (!user_id || !nom || !description || !price || !categories) {
    return res.status(400).json({ message: "Missing Data" });
  }

  try {
    // Vérification si le coktail existe
    let cocktail = await Cocktail.findOne({ where: { nom: nom }, raw: true });
    if (cocktail !== null) {
      return res
        .status(409)
        .json({ message: `The cocktail ${nom} already exists !` });
    }

    console.log("CAT", categories);
    const idCategories = categories.split(",");

    Cocktail.create(info)
      .then(async (cocktail) => {
        // idCategories.forEach((idCat) => {
        //   cocktail.addCategory(parseInt(idCat));
        await cocktail.setCategories(idCategories);
        // });

        return res.json({
          message: "Produit Ajoute avec Succes",
          data: cocktail,
        });
      })
      .catch((err) =>
        res
          .status(500)
          .json({ message: "Database Error add Category", error: err })
      );
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.updateCocktail = async (req, res) => {
  let cocktailId = parseInt(req.params.id);
  // let oldCocktail = await Cocktail.findOne({
  //   where: { id: cocktailId },
  // });

  console.log("FILE", req.files);
  const pathFiles = [];

  // const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
    pathFiles.push(req.files[i].path);
  }
  console.log("name array", pathFiles);
  console.log("cocktailId", cocktailId);
  console.log("Body nom", req.body.nom);
  // Vérification si le champ id est présent et cohérent
  if (!cocktailId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  try {
    // Recherche du cocktail et vérification
    let cocktail = await Cocktail.findOne({
      where: { id: cocktailId },
      // include: {
      //   model: Category,
      //   as: "categories",
      //   attributes: ["id", "nom", "description"],
      //   through: {
      //     attributes: [],
      //   },
      // },
    });
    if (cocktail === null) {
      return res
        .status(404)
        .json({ message: "This cocktail does not exist !" });
    }
    // if (cocktail) {
    //   deleteUploadedFile(cocktail.image);
    // }
    // const imagesToDel = [];
    // cocktail.images.forEach((img) => {
    //   if (!pathFiles.includes(img)) {
    //     imagesToDel.push(img);
    //   }
    // });
    // console.log("Image To delete", imagesToDel);
    let info = {
      images:
        pathFiles.length > 0
          ? [...cocktail.images, ...pathFiles]
          : cocktail.images,
      user_id: req.body.user_id,
      nom: req.body.nom,
      description: req.body.description,
      categories: req.body.categories,
      price: req.body.price,
    };
    console.log("updated cocktail", info);
    // let info = {
    //   image: req?.files ? req.file.path : cocktail.image,
    //   user_id: req.body.user_id,
    //   nom: req.body.nom,
    //   description: req.body.description,
    //   price: req.body.price,
    //   // categories: req.body.categories,
    // };

    // if (!req.file) {
    //   info.image = cocktail.image;
    // }
    // let categories = req.body.categories.split(",");

    const idCategories = req.body.categories.split(",");

    await cocktail.setCategories(idCategories);

    // Mise à jour du cocktail
    await Cocktail.update(info, { where: { id: cocktailId } });
    return res.json({ message: "Produit Mis A Jour" });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};
exports.deleteImageProduct = async (req, res) => {
  let cocktailId = parseInt(req.params.id);
  let imagePath = req.body.imagePath;
  console.log("cocktailId", cocktailId);
  console.log("imagePath", imagePath);
  // let oldCocktail = await Cocktail.findOne({
  //   where: { id: cocktailId },
  // });
  // Le chemin virtuel dans l'URL
  const urlPath = imagePath;
  console.log("urlPath", urlPath);

  // Vérification si le champ id est présent et cohérent
  if (!cocktailId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  try {
    // Recherche du cocktail et vérification
    let cocktail = await Cocktail.findOne({
      where: { id: cocktailId },
    });
    if (cocktail === null) {
      return res.status(404).json({ message: "Ce  produit n'existe pas !" });
    }
    const newImages = cocktail.images.filter((img) => img !== imagePath);
    cocktail.images = newImages;

    console.log("images", cocktail.images);

    // Mise à jour du cocktail pour image
    await Cocktail.update(
      { images: cocktail.images },
      { where: { id: cocktailId } }
    );
    deleteUploadedFile(urlPath);
    return res.json({ message: "image supprimer", data: cocktail });
  } catch (err) {
    return res.status(500).json({ message: "Database Error", error: err });
  }
};

exports.untrashCocktail = (req, res) => {
  let cocktailId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!cocktailId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  Cocktail.restore({ where: { id: cocktailId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.trashCocktail = (req, res) => {
  let cocktailId = parseInt(req.params.id);
  console.log("corbeile");

  // Vérification si le champ id est présent et cohérent
  if (!cocktailId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression du cocktail
  Cocktail.destroy({ where: { id: cocktailId } })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

exports.deleteCocktail = (req, res) => {
  let cocktailId = parseInt(req.params.id);

  // Vérification si le champ id est présent et cohérent
  if (!cocktailId) {
    return res.status(400).json({ message: "Missing parameter" });
  }

  // Suppression du cocktail
  Cocktail.destroy({ where: { id: cocktailId }, force: true })
    .then(() => res.status(204).json({}))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};
// 8. Upload Image Controller
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).array("images");

// 8. Delete Upload file
const deleteUploadedFile = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
    } else {
      console.log("Le fichier a été supprimé avec succès.");
    }
  });
};
