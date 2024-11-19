// routes/products.js
const express = require('express');
const prisma = require('@prisma/client').PrismaClient;

const router = express.Router();
const prismaClient = new prisma();

// Route to get all products
router.get('/all', async (req, res) => {
  try {
    const products = await prismaClient.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Route to get product by ID
router.get('/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const product = await prismaClient.product.findUnique({
      where: { product_id: productId }
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
