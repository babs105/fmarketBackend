/***********************************/
/*** Import des module nécessaires */
const express = require("express");
const checkTokenMiddleware = require("../jsonwebtoken/checkAuthUser");
const roleCtrl = require("../controllers/role");

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */
router.use(async (req, res, next) => {
  const event = new Date();
  console.log("role Time:", event.toString());
  next();
});

/**************************************/
/*** Routage de la ressource role */

router.get("", roleCtrl.getAllRoles);

router.get("/:id", roleCtrl.getRole);

router.put("", roleCtrl.addRole);

router.patch("/:id", roleCtrl.updateRole);

router.post("/untrash/:id", roleCtrl.untrashRole);

router.delete("/trash/:id", roleCtrl.trashRole);

router.delete("/:id", roleCtrl.deleteRole);

module.exports = router;
