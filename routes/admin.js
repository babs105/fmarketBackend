/***********************************/
/*** Import des module nécessaires */
const express = require("express");
const userCtrl = require("../controllers/user");
const roleCtrl = require("../controllers/role");
const cocktailCtrl = require("../controllers/cocktail");
const categoryCtrl = require("../controllers/category");
/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */
router.use(async (req, res, next) => {
  const event = new Date();
  console.log("admin Time:", event.toString());

  //   req.user;
  next();
});

/**********************************/
/*** Routage de la ressource User */

router.get("/users", userCtrl.getAllUserPage);
router.post("/users/assignrole", userCtrl.assignRoleToUser);
router.post("/users/unassignrole", userCtrl.unassignRoleToUser);
router.patch("/users/:id", userCtrl.updateUser);
router.post("/users/untrash/:id", userCtrl.untrashUser);
router.delete("/users/trash/:id", userCtrl.trashUser);
router.delete("/users/:id", userCtrl.deleteUser);
router.get("/users/otherrole/:id", userCtrl.getOtherRoleUser);

/**************************************/
/*** Routage de la ressource role */

router.get("/roles", roleCtrl.getAllRoles);
router.get("/roles/:id", roleCtrl.getRole);
router.put("/roles", roleCtrl.addRole);
router.patch("/roles/:id", roleCtrl.updateRole);
router.post("/roles/untrash/:id", roleCtrl.untrashRole);
router.delete("/roles/trash/:id", roleCtrl.trashRole);
router.delete("/roles/:id", roleCtrl.deleteRole);

/**************************************/
/*** Routage de la ressource Cocktail */

router.put("/cocktails", cocktailCtrl.upload, cocktailCtrl.addCocktail);
router.patch(
  "/cocktails/:id",
  cocktailCtrl.upload,
  cocktailCtrl.updateCocktail
);
router.patch("/cocktails/deleteImage/:id", cocktailCtrl.deleteImageProduct);
router.post("/cocktails/untrash/:id", cocktailCtrl.untrashCocktail);
router.delete("/cocktails/trash/:id", cocktailCtrl.trashCocktail);
router.delete("/cocktails/:id", cocktailCtrl.deleteCocktail);

/**************************************/
/*** Routage de la ressource category */

router.get("/categories/page", categoryCtrl.getAllCategoriesPage);
router.get("/categories/:id", categoryCtrl.getCategory);
router.put("/categories", categoryCtrl.addCategory);
router.patch("/categories/:id", categoryCtrl.updateCategory);
router.post("/categories/untrash/:id", categoryCtrl.untrashCategory);
router.delete("/categories/trash/:id", categoryCtrl.trashCategory);
router.delete("/categories/:id", categoryCtrl.deleteCategory);

module.exports = router;
