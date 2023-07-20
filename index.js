import express from "express";
import cors from "cors";
import { sequelize } from "./database/database.js";
import { Docente } from "./models/Docente.js";
import { Alumno } from "./models/Alumno.js";
import multer from "multer";

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

async function conexionBD() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente");
    await sequelize.sync({ force: true });
  } catch (error) {
    console.log("Problema de conexión", error);
  }
}

// Guardar o actualizar datos de un docente
app.post('/guardar-actualizar-docente', async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, fotoInput, cursos, universidad, carrera, titulo, descripcion, usuario, contraseñaActual, contraseñaNueva, contraseñaRepetir } = req.body;

  try {
    // Verificar si el docente existe en la base de datos
    const docenteExistente = await Docente.findOne({ where: { numeroDocumento } });

    if (docenteExistente) {
      // El docente ya existe, realizar actualización
      if (contraseñaActual !== docenteExistente.contraseña) {
        // La contraseña actual no coincide, devolver un error
        res.status(400).json({ message: 'La contraseña actual no es válida.' });
      } else if (contraseñaNueva && contraseñaNueva !== contraseñaRepetir) {
        // Las contraseñas nuevas no coinciden, devolver un error
        res.status(400).json({ message: 'Las contraseñas nuevas no coinciden.' });
      } else {
        // Crear un objeto con los datos de actualización
        const datosActualizacion = {
          nombres,
          apellidos,
          tipoDocumento,
          fotoInput,
          cursos,
          universidad,
          carrera,
          titulo,
          descripcion,
          usuario,
        };

        // Actualizar los datos del docente, incluyendo la contraseña si se proporciona
        if (contraseñaNueva) {
          datosActualizacion.contraseña = contraseñaNueva;
        }

        await Docente.update(datosActualizacion, { where: { numeroDocumento } });

        res.status(200).json({ message: 'Datos del docente actualizados exitosamente.' });
      }
    } else {
      // El docente no existe, entonces agrega
      await Docente.create({ nombres, apellidos, tipoDocumento, numeroDocumento, fotoInput, cursos, universidad, carrera, titulo, descripcion, usuario, contraseña: contraseñaNueva });

      res.status(200).json({ message: 'Datos del docente guardados exitosamente.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar o actualizar los datos del docente.' });
  }
});


// Guardar o actualizar datos de un alumno
app.post('/guardar-actualizar-alumno', async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, fotoInput, universidad, carrera, usuario, contraseñaActual, contraseñaNueva, contraseñaRepetir } = req.body;

  try {
    // Verificar si el alumno ya existe en la base de datos
    const alumnoExistente = await Alumno.findOne({ where: { numeroDocumento } });

    if (alumnoExistente) {
      // El alumno ya existe, realizar actualización
      if (contraseñaActual !== alumnoExistente.contraseña) {
        // La contraseña actual no coincide, devolver un error
        res.status(400).json({ message: 'La contraseña actual no es válida.' });
      } else if (contraseñaNueva && contraseñaNueva !== contraseñaRepetir) {
        // Las contraseñas nuevas no coinciden, devolver un error
        res.status(400).json({ message: 'Las contraseñas nuevas no coinciden.' });
      } else {
        // Crear un objeto con los datos de actualización
        const datosActualizacion = {
          nombres,
          apellidos,
          tipoDocumento,
          fotoInput,
          universidad,
          carrera,
          usuario,
        };

        // Actualizar los datos del alumno, incluyendo la contraseña si se proporciona
        if (contraseñaNueva) {
          datosActualizacion.contraseña = contraseñaNueva;
        }

        await Alumno.update(datosActualizacion, { where: { numeroDocumento } });

        res.status(200).json({ message: 'Datos del alumno actualizados exitosamente.' });
      }
    } else {
      // El alumno no existe, entonces agrega
      await Alumno.create({ nombres, apellidos, tipoDocumento, numeroDocumento, fotoInput, universidad, carrera, usuario, contraseña: contraseñaNueva });

      res.status(200).json({ message: 'Datos del alumno guardados exitosamente.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar o actualizar los datos del alumno.' });
  }
});
app.get("/", function(req, res){
  res.send("Si hay conexion al servidor");
})
app.listen(port, async function () {
  console.log("El servidor se encuentra activo en el puerto: " + port);
  conexionBD();
});