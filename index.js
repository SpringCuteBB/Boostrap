const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3000; // Usar el puerto proporcionado por el entorno
const routes = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.route = (name) => routes[name] || "#";
  next();
});

// AQUI INSERTAR RUTAS
routes.home = "/";
routes.about = "/about";
routes.contact = "/contact";
routes.contacted = "/contacted";

const anioActual = new Date().getFullYear();

// RUTAS
app.get(routes.home, (req, res) => {
  res.render("index", { anioActual: anioActual });
});
app.get(routes.about, (req, res) => {
  res.render("about", { anioActual: anioActual });
});
app.get(routes.contact, (req, res) => {
  res.render("contact", { anioActual: anioActual });
});
app.get(routes.contacted, (req, res) => {
  const name = req.query.name || "Usuario";
  res.render("contacted", { anioActual: anioActual, name: name });
});
// API para enviar el formulario de contacto
app.post("/Form", async (req, res) => {
  console.log(req.body);
  const { name, email, subject, message } = req.body;

  // Validar los datos
  const errors = [];
  if (!name) errors.push("El nombre es obligatorio.");
  if (!email) {
    errors.push("El correo electrónico es obligatorio.");
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push("El correo electrónico no es válido.");
  }
  if (!subject) errors.push("El asunto es obligatorio.");
  if (!message) errors.push("El mensaje es obligatorio.");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Configuración del transporte de nodemailer
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Configuración del correo
  let mailOptions = {
    from: email,
    to: "bunbonofficialmail@gmail.com",
    subject: subject,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo Electrónico:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Mensaje:</strong><br>${message}</p>
    `,
  };

  // Enviar el correo
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado exitosamente." });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo." });
  }
});

//-----------------
app.listen(port, () => {
  console.log(`Servidor activo en ${port}: http://localhost:${port}`);
});
