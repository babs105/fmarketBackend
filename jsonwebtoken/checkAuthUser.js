/***********************************/
/*** Import des module nécessaires */
const jwt = require("jsonwebtoken");
const DB = require("../db.config");
const User = DB.User;
const Role = DB.Role;

/*************************/
/*** Extraction du token */
const extractBearer = (authorization) => {
  if (typeof authorization !== "string") {
    return false;
  }

  // On isole le token
  const matches = authorization.match(/(bearer)\s+(\S+)/i);

  return matches && matches[2];
};

/******************************************/
/*** Vérification de la présence du token */
const checkAuthUserMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization && extractBearer(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Ho le petit malin !!!" });
  }

  // Vérifier la validité du token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Bad token" });
    }

    console.log("decode role", decodedToken.roles);
    console.log("url", req.originalUrl);

    // let hasAdminRole = req.roles.includes("ADMIN");
    if (
      req.originalUrl.startsWith("/private") &&
      !decodedToken.roles.includes("USER")
    ) {
      return res
        .status(403)
        .json({ message: "Vous navez pas access a cette Ressource" });
    }

    next();
  });
};

module.exports = checkAuthUserMiddleware;
