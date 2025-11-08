// ==========================
// 🌐 SMILE ZONE BACKEND
// ==========================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

// --- Configuración básica ---
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Servir imágenes

// --- Configuración de multer (para subir imágenes) ---
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

// --- Archivo de productos ---
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

// ✅ Verificación de servidor
app.get("/", (req, res) => {
  res.send("🚀 Smile Zone Backend funcionando correctamente");
});

// ✅ Obtener productos
app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// ✅ Subir imagen (desde el admin)
app.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// ✅ Agregar producto
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

// ✅ Modificar producto existente
app.put("/update-product", (req, res) => {
  const { id, name, price, image, category, description } = req.body;
  let products = loadProducts();

  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

  products[index] = { id, name, price, image, category, description };
  saveProducts(products);

  res.json({ message: "🛠️ Producto actualizado correctamente", product: products[index] });
});

// ✅ Eliminar producto
app.post("/delete-product", (req, res) => {
  const { id } = req.body;
  let products = loadProducts();

  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);

  res.json({ message: "🗑️ Producto eliminado correctamente" });
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));