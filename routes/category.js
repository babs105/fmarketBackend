/***********************************/
/*** Import des module nécessaires */
const express = require("express");
const categoryCtrl = require("../controllers/category");
const checkAdminRoleMiddleware = require("../jsonwebtoken/checkAdminRole");
const checkAuthUserMiddleware = require("../jsonwebtoken/checkAuthUser");

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */
router.use((req, res, next) => {
  const event = new Date();
  console.log("category Time:", event.toString());
  next();
});

/**************************************/
/*** Routage de la ressource category */

router.get("", categoryCtrl.getAllCategories);
router.get("/page", categoryCtrl.getAllCategoriesPage);

router.get("/:id", categoryCtrl.getCategory);

router.put(
  "",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  categoryCtrl.addCategory
);

router.patch(
  "/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  categoryCtrl.updateCategory
);

router.post(
  "/untrash/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  categoryCtrl.untrashCategory
);

router.delete(
  "/trash/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  categoryCtrl.trashCategory
);

router.delete(
  "/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  categoryCtrl.deleteCategory
);

module.exports = router;
