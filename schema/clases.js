const router = require("express").Router();
const DB = require("./config_db");

router.get("/claseActiva", (req, res) => {
  const SQL_QUERY = `
      SELECT 
        c.id AS clase_id,
        c.*, 
        (SELECT COUNT(*) FROM asistencia WHERE clase_id = c.id) AS total_asistencias, 
        (SELECT COUNT(*) FROM alumnos) AS total_alumnos 
      FROM 
        clases c 
      WHERE 
        c.active = 1 
      LIMIT 1;

  `;

  // Consulta a la base de datos
  DB.query(SQL_QUERY, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Ocurrió un error en el servidor. Inténtalo más tarde.",
      });
    }

    // Caso: No se encontró ninguna clase activa
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "No hay clases activas en este momento.",
      });
    }

    // Caso: Clase activa encontrada
    res.json({
      success: true,
      clase: result[0], // Devuelve solo la clase activa
    });
  });
});

router.post("/claseRemover", (req, res) => {
  const SQL_QUERY = "UPDATE clases SET active = 0 WHERE active = 1;";
  DB.query(SQL_QUERY, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del lado del servidor",
      });
    }

    if (result.affectedRows > 0) {
      res.status(201).json({
        success: true,
        message: "Clase REMOVIDA con éxito",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo REMOVER la clase",
      });
    }
  });
});

router.post("/claseCrear", (req, res) => {
  const { title, profesor_id } = req.body;

  const SQL_QUERY =
    "INSERT INTO clases (title, active, date, profesor_id) VALUES (?, 1, CURDATE(), ?)";
  DB.query(SQL_QUERY, [title, profesor_id], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del lado del servidor",
      });
    }

    if (result.affectedRows > 0) {
      res.status(201).json({
        success: true,
        message: "Clase creada con éxito",
        claseId: result.insertId, // ID de la clase recién creada
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo crear la clase",
      });
    }
  });
});

router.post("/claseSendVersiculo", (req, res) => {
  const { versiculo } = req.body;

  const SQL_QUERY = "UPDATE clases SET versiculo = ? WHERE active = 1 LIMIT 1;";
  DB.query(SQL_QUERY, [versiculo], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del lado del servidor",
      });
    }

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: "Versículo agregado con exito",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo subir la cita bíblica",
      });
    }
  });
});

router.post("/claseSendYoutube", (req, res) => {
  const { link } = req.body;

  const SQL_QUERY = "UPDATE clases SET enlace = ? WHERE active = 1 LIMIT 1;";
  DB.query(SQL_QUERY, [link], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del lado del servidor",
      });
    }

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: "En lace agregado con exito",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo subir el link de Youtube",
      });
    }
  });
});

router.get("/getAllAlumnos", (req, res) => {
  const SQL_QUERY = `
    SELECT 
      alumnos.id, 
      alumnos.name, 
      alumnos.lastname,
      COALESCE(asistencia.puntos, 0) AS puntos,
      CASE 
        WHEN asistencia.id IS NOT NULL THEN 1 
        ELSE 0 
      END AS asistencia
    FROM 
      alumnos
    LEFT JOIN 
      asistencia 
    ON 
      alumnos.id = asistencia.alumno_id 
      AND asistencia.clase_id = (SELECT id FROM clases WHERE active = 1 LIMIT 1);
  `;

  // Consulta a la base de datos
  DB.query(SQL_QUERY, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Ocurrió un error en el servidor. Inténtalo más tarde.",
      });
    }

    // Caso: No se encontró ninguna clase activa
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "No hay alumnos registrados en este momento.",
      });
    }

    // Caso: Clase activa encontrada
    res.json({
      success: true,
      clase: result, // Devuelve todos los alumnos registrados
    });
  });
});

router.post("/setAlumnoAsistencia", (req, res) => {
  const { alumno_id, clase_id } = req.body;

  const SQL_QUERY =
    "INSERT INTO asistencia (alumno_id, clase_id) VALUES (?, ?);";
  DB.query(SQL_QUERY, [alumno_id, clase_id], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del lado del servidor",
      });
    }

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: "Alumno registrado a la clase con exito.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo agregar el alumno a la clase.",
      });
    }
  });
});

router.post("/removeAlumnoAsistencia", (req, res) => {
  const { alumno_id, clase_id } = req.body;

  // Validación de entrada
  if (!alumno_id || !clase_id) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos requeridos: alumno_id y clase_id",
    });
  }

  const SQL_QUERY =
    "DELETE FROM asistencia WHERE alumno_id = ? AND clase_id = ?";

  DB.query(SQL_QUERY, [alumno_id, clase_id], (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del lado del servidor",
      });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Alumno removido de la clase con éxito.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No se encontró el alumno en la clase.",
      });
    }
  });
});

router.get("/getAllYoutube", (req, res) => {
  const SQL_QUERY =
    "SELECT enlace FROM clases WHERE enlace IS NOT NULL ORDER BY id DESC LIMIT 5;";

  // Consulta a la base de datos
  DB.query(SQL_QUERY, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Ocurrió un error en el servidor. Inténtalo más tarde.",
      });
    }

    // Caso: No se encontró ninguna clase activa
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "No se encontraron enlaces de Youtube.",
      });
    }

    // Caso: Clase activa encontrada
    res.json({
      success: true,
      clase: result, // Devuelve todos los alumnos registrados
    });
  });
});
module.exports = router;
