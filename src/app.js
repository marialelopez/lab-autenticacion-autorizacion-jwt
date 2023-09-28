const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const users = [
  { email: "admin@example.com", name: "admin", rol: "admin" },
  { email: "user@example.com", name: "user", rol: "user" },
];

app.use(express.json());

app.get("/", function (req, res) {
  res.send("Bienvenido a la api de ADA Cars");
});

function generarToken(user) {
  return jwt.sign(user, "SECRET_KEY", { algorithm: "HS256" });
}

app.post("/auth", (req, res) => {
  const { email } = req.body;
  const usuario = users.find((user) => user.email === email);
  if (!usuario) {
    return res.status(401).send({ error: "Invalid user name or password" });
  }
  const token = generarToken(usuario);
  res.json({ token });
});

function JWTValidation(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "error" });
  }
  jwt.verify(
    token,
    "SECRET_KEY",
    { algorithms: ["HS256"] },
    (error, decoded) => {
      if (error) {
        return res.status(401).json({ error: "token invalido" });
      }
      const { rol } = decoded;
      req.headers = { ...req.headers, rol };
      next();
    }
  );
}

app.get("/premium-clients", JWTValidation, (req, res) => {
  if (req.headers.rol === "admin") {
    res.send("premium-clients list");
  } else {
    res.status(403).json("Access not allowed");
  }
});

app.get("/medium-clients", JWTValidation, (req, res) => {
  if (req.headers.rol === "admin" || req.headers.rol === "user") {
    res.send("medium-clients list");
  }
});

module.exports = app;
