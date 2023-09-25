/***********************************/
/*** Import des module nécessaires */
const express = require("express");
const userCtrl = require("../controllers/user");

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */
router.use(async (req, res, next) => {
  const event = new Date();
  console.log("User Time:", event.toString());

  //   req.user;
  next();
});

/**********************************/
/*** Routage de la ressource User */

router.get("/users/:id", userCtrl.getUser);
router.patch("/users/:id", userCtrl.updateUser);

module.exports = router;
