// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" })); // soporte base64 grande
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer for direct file uploads (FormData)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const productsFile = path.join(__dirname, "products.json");

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

// Routes

app.get("/", (req, res) => {
  res.send("🚀 Smile Zone Backend funcionando correctamente");
});

app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// Upload endpoint (FormData file). Returns URL.
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Add product (image can be URL or base64 string)
app.post("/add-product", (req, res) => {
  const { name, price, image, category, description } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Faltan campos obligatorios" });

  const products = loadProducts();
  const newProduct = { id: Date.now(), name, price, image: image || "", category: category || "", description: description || "" };
  products.push(newProduct);
  saveProducts(products);
  res.json({ message: "✅ Producto agregado", product: newProduct });
});

// Update product
app.post("/update-product", (req, res) => {
  const { id, name, price, image, category, description } = req.body;
  if (!id) return res.status(400).json({ error: "Falta id" });

  let products = loadProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Producto no encontrado" });

  products[idx] = { id, name, price, image: image || products[idx].image, category, description };
  saveProducts(products);
  res.json({ message: "🛠️ Producto actualizado", product: products[idx] });
});

// Delete product
app.post("/delete-product", (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Falta id" });

  let products = loadProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return res.status(404).json({ error: "Producto no encontrado" });

  saveProducts(filtered);
  res.json({ message: "🗑️ Producto eliminado" });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));