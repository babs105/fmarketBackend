/***********************************/
/*** Import des module nécessaires */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const DB = require("../db.config");
const User = DB.User;
const Role = DB.Role;

/**********************************/
/*** Routage de la ressource Auth */

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("body :", req.body);

  // Validation des données reçues
  if (!email || !password) {
    return res.status(400).json({ message: "Bad email or password" });
  }

  try {
    // Vérification si l'utilisateur existe
    let user = await User.findOne({
      where: { email: email },
      // raw: true,
    });
    if (user === null) {
      return res
        .status(401)
        .json({ message: "This account does not exists !" });
    }
    console.log("USER :", user);
    // Vérification du mot de passe
    //let test = await bcrypt.compare(password, user.password)
    let test = await User.checkPassword(password, user.password);

    console.log("TEST :", test);
    if (!test) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const rolesArray = await user.getRoles();
    const roles = rolesArray.map((role) => role.nom);
    console.log("ROLES test");
    // Génération du token et envoi
    const token = jwt.sign(
      {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles: roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_DURING }
    );
    console.log("Token :", token);

    return res.json({
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles,
      },
      token,
    });
  } catch (err) {
    if (err.name == "SequelizeDatabaseError") {
      res.status(500).json({ message: "Database Error", error: err });
    }
    res.status(500).json({ message: "Login process failed", error: err });
  }
};
exports.register = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  // Validation des données reçues
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: "Missing Data" });
  }

  try {
    // Vérification si l'utilisateur existe déjà
    const user = await User.findOne({ where: { email: email }, raw: true });
    if (user !== null) {
      return res
        .status(409)
        .json({ message: `The user ${nom} already exists !` });
    }

    // Hashage du mot de passe utilisateur
    //let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
    //req.body.password = hash

    // set role "USER" to USER
    const role = await Role.findOne({ where: { nom: "USER" }, raw: true });
    if (role === null) {
      return res.status(401).json({ message: "This Role does not exists !" });
    }
    // Céation de l'utilisateur
    let userc = await User.create(req.body);
    userc = await userc.addRole(role.id);
    return res.json({ message: "User Created", data: userc });
  } catch (err) {
    if (err.name == "SequelizeDatabaseError") {
      res.status(500).json({ message: "Database Error", error: err });
    }
    res.status(500).json({ message: "Hash Process Error", error: err });
  }
};
