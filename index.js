// ==========================
// 🌐 SMILE ZONE BACKEND
// ==========================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// --- Middlewares ---
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // Soporta imágenes en base64

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

// ✅ Agregar nuevo producto
app.post("/add-product", (req, res) => {
  const { name, price, image, category, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Faltan campos obligatorios (nombre o precio)" });
  }

  const products = loadProducts();

  const newProduct = {
    id: Date.now(),
    name,
    price,
    image, // Puede ser URL o base64
    category,
    description,
  };

  products.push(newProduct);
  saveProducts(products);

  res.json({ message: "✅ Producto agregado correctamente", product: newProduct });
});

// ✅ Actualizar producto existente
app.post("/update-product", (req, res) => {
  const { id, name, price, image, category, description } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto a actualizar" });
  }

  let products = loadProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products[index] = { id, name, price, image, category, description };
  saveProducts(products);

  res.json({ message: "🛠️ Producto actualizado correctamente", product: products[index] });
});

// ✅ Eliminar producto
app.post("/delete-product", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto a eliminar" });
  }

  const products = loadProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  saveProducts(filtered);
  res.json({ message: "🗑️ Producto eliminado correctamente" });
});

// ✅ Ruta de prueba base
app.get("/", (req, res) => {
  res.send("🚀 Smile Zone Backend funcionando correctamente");
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));