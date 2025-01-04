const router = require("express").Router();
const DB = require("./config_db");

router.post("/nameProfesor", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "NO SE ENCONTRO EL USUARIO PARA VALIDAR LA INFORMACIÓN",
    });
  }

  const SQL_QUERY = "SELECT name FROM profesores WHERE id = ?";

  DB.query(SQL_QUERY, [id], (err, result) => {
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
        message: "Error al encontrar a este usuario",
      });
    }

    // Caso: Usuario encontrado
    res.json({
      success: true,
      user: result[0], // Devuelve solo el primer resultado
    });
  });
});

router.post("/setAlumnoPunto", (req, res) => {
  const { puntos, alumno_id, clase_id } = req.body;

  if (!alumno_id || !clase_id || puntos === undefined) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "NO SE PUDO PROCESAR POR FALTA DE INFORMACION",
    });
  }

  const SQL_QUERY =
    "UPDATE asistencia SET puntos = ? WHERE alumno_id = ? AND clase_id = ?";

  DB.query(SQL_QUERY, [puntos, alumno_id, clase_id], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Ocurrió un error en el servidor. Inténtalo más tarde.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "No se encontró ninguna asistencia para actualizar",
      });
    }

    res.json({
      success: true,
      message: "Puntos actualizados correctamente",
    });
  });
});

module.exports = router;
