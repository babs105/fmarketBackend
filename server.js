/************************************/
/*** Import des modules nécessaires */
const express = require("express");
const cors = require("cors");
const checkAuthUserMiddleware = require("./jsonwebtoken/checkAuthUser");
const checkAdminRoleMiddleware = require("./jsonwebtoken/checkAdminRole");
/************************************/
/*** Import de la connexion à la DB */
let DB = require("./db.config");

/*****************************/
/*** Initialisation de l'API */
const app = express();

// Use PORT provided in environment or default to 3000
const port = process.env.SERVER_PORT || 3000;
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders:
//       "Origin, X-Requested-With, x-access-token, role, Content, Accept, Content-Type, Authorization",
//   })
// );
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/***********************************/
/*** Import des modules de routage */
// const user_router = require("./routes/users");
// const cocktail_router = require("./routes/cocktails");
// const category_router = require("./routes/category");
// const auth_router = require("./routes/auth");
// const role_router = require("./routes/roles");
const admin_router = require("./routes/admin");
const private_router = require("./routes/private");
const public_router = require("./routes/public");

/******************************/
/*** Mise en place du routage */

app.get("/", (req, res) => res.send(`I'm online. All is OK !`));

// app.use("/cocktails", cocktail_router);
// app.use("/categories", category_router);
// app.use("/users", checkAuthUserMiddleware, user_router);
// app.use(
//   "/admin/users",
//   checkAuthUserMiddleware,
//   checkAdminRoleMiddleware,
//   user_admin_router
// );

app.use("/public", public_router);
app.use("/private", checkAuthUserMiddleware, private_router);
app.use("/admin", checkAdminRoleMiddleware, admin_router);
// app.use(
//   "/roles",
//   checkAuthUserMiddleware,
//   checkAdminRoleMiddleware,
//   role_router
// );
// app.use("/auth", auth_router);

//static Images Folder
app.use("/Images", express.static("./Images"));
app.get("*", (req, res) =>
  res.status(501).send("What the hell are you doing !?!")
);
/********************************/
/*** Start serveur avec test DB */
DB.sequelize
  .authenticate()
  .then(() => console.log("Database connection OK"))
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`This server is running on port ${port}. Have fun !`);
    });
  })
  .catch((err) => console.log("Database Error", err));
