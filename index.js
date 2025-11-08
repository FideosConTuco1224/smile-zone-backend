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
app.use(express.json());

// --- Ruta del archivo donde se guardan los productos ---
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

// Obtener todos los productos
app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// Agregar producto nuevo
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
    image,
    category,
    description,
  };

  products.push(newProduct);
  saveProducts(products);

  res.json({ message: "✅ Producto agregado correctamente", product: newProduct });
});

// Editar producto existente
app.put("/update-product/:id", (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  const products = loadProducts();

  const index = products.findIndex(p => p.id == id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

  products[index] = { ...products[index], ...updated };
  saveProducts(products);

  res.json({ message: "🛠️ Producto actualizado correctamente", product: products[index] });
});

// Eliminar producto
app.delete("/delete-product/:id", (req, res) => {
  const { id } = req.params;
  const products = loadProducts().filter(p => p.id != id);
  saveProducts(products);
  res.json({ message: "🗑️ Producto eliminado correctamente" });
});

// --- Ruta base ---
app.get("/", (req, res) => {
  res.send("🚀 Smile Zone Backend funcionando correctamente");
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));