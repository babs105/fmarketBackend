/***********************************/
/*** Import des module nécessaires */
const express = require("express");
const authCtrl = require("../controllers/auth");
const cocktailCtrl = require("../controllers/cocktail");
const categoryCtrl = require("../controllers/category");

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */
router.use(async (req, res, next) => {
  const event = new Date();
  console.log("public :", event.toString());

  //   req.user;
  next();
});

/**********************************/
/*** Routage de la ressource Auth */

router.post("/auth/login", authCtrl.login);
router.put("/auth/register", authCtrl.register);

/**************************************/
/*** Routage de la ressource Cocktail */
router.get("/cocktails", cocktailCtrl.getAllCocktails);
router.get("/cocktails/:id", cocktailCtrl.getCocktail);

/**************************************/
/*** Routage de la ressource category */
router.get("/categories", categoryCtrl.getAllCategories);

module.exports = router;
