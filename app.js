const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql");

require("dotenv").config();
const port = process.env.SERVER_PORT || 5000;

/* Creamos la conexion con Mysql */
const DB = require("./schema/config_db");

DB.connect((err) => {
  if (err) {
    console.log("[Mysql]: No fue posible conectar con la base de Datos.");
    throw err;
  }
  console.log(`
    ===================================================
    [MySQL]: Conexión exitosa con la base de datos.
    ===================================================
  `);
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* Consultas apuntando a MYSQL */
app.use("/api/schema", require("./schema/login.js"));
app.use("/api/schema", require("./schema/usuarios.js"));
app.use("/api/schema", require("./schema/clases.js"));

app.listen(port, () => {
  console.log(`Servidor iniciado correctamente, escuchando el puerto: ${port}`);
});
