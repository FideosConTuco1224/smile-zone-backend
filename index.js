// ==========================
// 🌐 SMILE ZONE BACKEND (versión final)
// ==========================
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// --- Carpeta para subir imágenes ---
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// --- Configuración de multer para subir imágenes ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// --- Archivo donde se guardan los productos ---
const productsFile = path.join("./products.json");

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

// 🟢 Obtener todos los productos
app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// 🟢 Agregar un nuevo producto con imagen subida
app.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, category, description } = req.body;
  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : "";

  if (!name || !price) {
    return res.status(400).json({ error: "Faltan campos obligatorios (nombre o precio)" });
  }

  const products = loadProducts();
  const newProduct = {
    id: Date.now(),
    name,
    price,
    category,
    description,
    image: imageUrl,
  };

  products.push(newProduct);
  saveProducts(products);
  res.json({ message: "✅ Producto agregado correctamente", product: newProduct });
});

// 🛠️ Modificar producto existente
app.put("/edit-product/:id", (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  let products = loadProducts();

  const index = products.findIndex((p) => p.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

  products[index] = { ...products[index], ...updated };
  saveProducts(products);

  res.json({ message: "🛠️ Producto actualizado correctamente", product: products[index] });
});

// 🗑️ Eliminar producto
app.delete("/delete-product/:id", (req, res) => {
  const { id } = req.params;
  let products = loadProducts();

  const filtered = products.filter((p) => p.id !== parseInt(id));
  saveProducts(filtered);

  res.json({ message: "🗑️ Producto eliminado correctamente" });
});

// 📁 Servir imágenes subidas
app.use("/uploads", express.static(path.resolve("uploads")));

// --- Ruta base ---
app.get("/", (req, res) => {
  res.send("🚀 Smile Zone Backend funcionando correctamente con subida de imágenes");
});

// === INICIAR SERVIDOR ===
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));