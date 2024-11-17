const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".svg") {
      return cb(new Error("Only SVG files are allowed"), false);
    }
    cb(null, true);
  },
});
const publicStripeKey = process.env.PUBLIC_STRIPE_KEY;
const secretStripeKey = process.env.SECRET_STRIPE_KEY;
const stripe = require("stripe")(secretStripeKey);
const password = process.env.PASSWORD;

const port = process.env.PORT; // Usar el puerto proporcionado por el entorno
const routes = {};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

if (!fs.existsSync("public/uploads")) {
  fs.mkdirSync("public/uploads", { recursive: true });
}

app.use((req, res, next) => {
  res.locals.route = (name) => routes[name] || "#";
  next();
});

// Middleware de autenticación
function authMiddleware(req, res, next) {
  if (req.session.authenticated) {
    return next();
  } else {
    res.redirect("/login");
  }
}
// Middleware para manejar la subida de archivos condicionalmente
const uploadFields = (req, res, next) => {
  const fields = [
    { name: "productImage", maxCount: 1 },
    { name: "productImageLayOut", maxCount: 1 },
  ];

  const uploadMiddleware = upload.fields(fields);
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// AQUI INSERTAR RUTAS
routes.home = "/";
routes.about = "/about";
routes.contact = "/contact";
routes.contacted = "/contacted";
routes.physicalStores = "/physical-stores";
routes.onlineStores = "/online-stores";
routes.orders = "/orders";
routes.controlPanel = "/control-panel";
routes.login = "/login";

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
app.get(routes.controlPanel, authMiddleware, (req, res) => {
  fs.readFile(path.join(__dirname, "products.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).send("Error reading products.json");
    }
    const products = JSON.parse(data);
    res.render("controlPanel", { anioActual: anioActual, products: products });
  });
});
app.get(routes.login, (req, res) => {
  res.render("login", { anioActual: anioActual });
});

app.post(routes.login, (req, res) => {
  const { password: enteredPassword } = req.body;
  if (enteredPassword === password) {
    req.session.authenticated = true;
    res.redirect(routes.controlPanel);
  } else {
    res.render("login", {
      anioActual: anioActual,
      error: "Contraseña incorrecta",
    });
  }
});

app.post("/addProduct", uploadFields, (req, res) => {
  console.log(req.body);
  console.log(req.files);

  const { productType, productPart, productName, productColor } = req.body;

  if (!productType || !productPart || !productName || !req.files.productImage) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (productPart !== "decoracion" && !productColor) {
    return res.status(400).json({ error: "El campo color es obligatorio" });
  }

  const imagePath = `/uploads/${req.files.productImage[0].filename}`;
  const imageLayOutPath = req.files.productImageLayOut
    ? `/uploads/${req.files.productImageLayOut[0].filename}`
    : null;

  console.log(imagePath);
  console.log(productType, productPart, productName, productColor);

  fs.readFile("products.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo JSON:", err);
      return res.status(500).json({ error: "Error al leer el archivo JSON" });
    }

    const products = JSON.parse(data);

    if (products[productType] && products[productType][productPart]) {
      const newProduct = {
        nombre: productName,
        imagen: imagePath,
      };

      if (productPart === "decoracion") {
        newProduct.imagenLayout = imageLayOutPath;
      } else {
        newProduct.color = productColor;
      }

      products[productType][productPart].contenido.push(newProduct);

      fs.writeFile(
        "products.json",
        JSON.stringify(products, null, 2),
        (err) => {
          if (err) {
            console.error("Error al escribir el archivo JSON:", err);
            return res
              .status(500)
              .json({ error: "Error al escribir el archivo JSON" });
          }

          res.render("controlPanel", { anioActual: anioActual, products });
        }
      );
    } else {
      res.status(400).json({ error: "Categoría o subcategoría no encontrada" });
    }
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
