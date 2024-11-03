const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const publicStripeKey = process.env.PUBLIC_STRIPE_KEY;
const secretStripeKey = process.env.SECRET_STRIPE_KEY;
const stripe = require("stripe")(secretStripeKey);

const port = process.env.PORT; // Usar el puerto proporcionado por el entorno
const routes = {};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
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
routes.physicalStores = "/physical-stores";
routes.onlineStores = "/online-stores";
routes.orders = "/orders";

const anioActual = new Date().getFullYear();

//JSON
app.get("/api/data", (req, res) => {
  res.sendFile(path.join(__dirname, "products.json"));
});
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
app.get(routes.physicalStores, (req, res) => {
  res.render("physicalStores", { anioActual: anioActual });
});
app.get(routes.onlineStores, (req, res) => {
  res.render("onlineStores", { anioActual: anioActual });
});
app.get(routes.orders, (req, res) => {
  res.render("orders", {
    anioActual: anioActual,
    publicStripeKey: publicStripeKey,
  });
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
    to: process.env.EMAIL_USER,
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

app.post("/purchase", (req, res) => {
  let total = 0;
  req.body.contenido.forEach((element) => {
    Object.values(element.pedido.Prop).forEach((prop) => {
      if (prop !== null) {
        total += 4;
      }
    });
  });
  stripe.charges
    .create({
      amount: total * 100,
      source: req.body.id,
      currency: "eur",
    })
    .then(() => {
      console.log("Pago exitoso");
      res.json({ message: "Pago exitoso" });
    })
    .catch(() => {
      console.log("Pago fallido");
      res.status(500).end();
    });
});

//-----------------
app.listen(port, () => {
  console.log(`Servidor activo en ${port}: http://localhost:${port}`);
});
