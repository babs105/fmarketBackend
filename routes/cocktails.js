/***********************************/
/*** Import des module nécessaires */
const express = require("express");
const checkAuthUserMiddleware = require("../jsonwebtoken/checkAuthUser");
const cocktailCtrl = require("../controllers/cocktail");
const checkAdminRoleMiddleware = require("../jsonwebtoken/checkAdminRole");

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */
router.use((req, res, next) => {
  const event = new Date();
  console.log("Cocktail Time:", event.toString());
  next();
});

/**************************************/
/*** Routage de la ressource Cocktail */

router.get("", cocktailCtrl.getAllCocktails);

router.get("/:id", cocktailCtrl.getCocktail);

router.put(
  "",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  cocktailCtrl.upload,
  cocktailCtrl.addCocktail
);

router.patch(
  "/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  cocktailCtrl.upload,
  cocktailCtrl.updateCocktail
);

router.post(
  "/untrash/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  cocktailCtrl.untrashCocktail
);

router.delete(
  "/trash/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  cocktailCtrl.trashCocktail
);

router.delete(
  "/:id",
  checkAuthUserMiddleware,
  checkAdminRoleMiddleware,
  cocktailCtrl.deleteCocktail
);

module.exports = router;
