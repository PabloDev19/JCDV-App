const router = require("express").Router();
const DB = require("./config_db");

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validación de entrada
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "Porfavor, ingresa tu nombre y contraseña.",
    });
  }

  const SQL_QUERY =
    "SELECT id, last_connexion FROM profesores WHERE name = ? AND password = ?";

  // Consulta a la base de datos
  DB.query(SQL_QUERY, [username, password], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Ocurrió un error en el servidor. Inténtalo más tarde.",
      });
    }

    // Caso: Credenciales incorrectas
    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "El usuario o la contraseña son incorrectos.",
      });
    }

    // Caso: Usuario encontrado
    res.json({
      success: true,
      user: result[0], // Devuelve solo el primer resultado
    });
  });
});

module.exports = router;
