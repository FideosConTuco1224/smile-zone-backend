const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const productsFile = path.join(__dirname, "products.json");

// Leer productos
function loadProducts() {
  try {
    const data = fs.readFileSync(productsFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Guardar productos
function saveProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

// Obtener productos
app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// Agregar producto
app.post("/add-product", (req, res) => {
  const { name, price, image, category, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Nombre y precio son requeridos" });
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

  res.json({ message: "✅ Producto agregado!", product: newProduct });
});

// Editar producto
app.post("/update-product", (req, res) => {
  const { id, name, price, image, category, description } = req.body;
  const products = loadProducts();

  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products[index] = { id, name, price, image, category, description };
  saveProducts(products);

  res.json({ message: "✅ Producto actualizado!" });
});

// Eliminar producto
app.post("/delete-product", (req, res) => {
  const { id } = req.body;
  let products = loadProducts();

  const productExists = products.some((p) => p.id === id);
  if (!productExists) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products = products.filter((p) => p.id !== id);
  saveProducts(products);

  res.json({ message: "🗑️ Producto eliminado correctamente" });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Backend activo en http://localhost:${PORT}`)
);
