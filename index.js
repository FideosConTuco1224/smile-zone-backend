// ==========================
// 🌐 SMILE ZONE BACKEND (versión mejorada)
// ==========================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// --- Middlewares ---
app.use(
  cors({
    origin: "*", // permite que tu frontend (Vercel) acceda sin problema
  })
);
app.use(express.json());

// --- Archivo donde se guardan los productos ---
const productsFile = path.join(__dirname, "products.json");

// === FUNCIONES AUXILIARES ===
function loadProducts() {
  try {
    const data = fs.readFileSync(productsFile, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

// === RUTAS ===

// ✅ Obtener todos los productos
app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// ✅ Agregar un nuevo producto
app.post("/add-product", (req, res) => {
  const { name, price, images, videos, category, description } = req.body;

  if (!name || !price) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios (nombre o precio)" });
  }

  const products = loadProducts();

  const newProduct = {
    id: Date.now(),
    name,
    price,
    images: images && Array.isArray(images) ? images : [],
    videos: videos && Array.isArray(videos) ? videos : [],
    category,
    description,
  };

  products.push(newProduct);
  saveProducts(products);

  res.json({
    message: "✅ Producto agregado correctamente",
    product: newProduct,
  });
});

// ✅ Modificar producto existente
app.post("/update-product", (req, res) => {
  const { id, name, price, images, videos, category, description } = req.body;
  let products = loadProducts();

  const index = products.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });

  products[index] = {
    id,
    name,
    price,
    images: images || [],
    videos: videos || [],
    category,
    description,
  };

  saveProducts(products);
  res.json({ message: "🛠️ Producto actualizado correctamente" });
});

// ✅ Eliminar producto
app.post("/delete-product", (req, res) => {
  const { id } = req.body;
  let products = loadProducts();

  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);

  res.json({ message: "🗑️ Producto eliminado correctamente" });
});

// ✅ Ruta base
app.get("/", (req, res) => {
  res.send("🚀 Smile Zone Backend funcionando correctamente ✅");
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor activo en puerto ${PORT}`)
);
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Nueva ruta para subir imágenes
app.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = `https://smile-zone-backend-1.onrender.com/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Servir imágenes subidas
app.use("/uploads", express.static(path.join(__dirname, "uploads")));