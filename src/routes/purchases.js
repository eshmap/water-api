const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Complete Purchase Route
router.post('/complete', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const {
    street,
    city,
    province,
    country,
    postal_code,
    credit_card,
    credit_expire,
    credit_cvv,
    cart,
    invoice_amt,
    invoice_tax,
    invoice_total,
  } = req.body;

  // Validate inputs
  if (
    !street ||
    !city ||
    !province ||
    !country ||
    !postal_code ||
    !credit_card ||
    !credit_expire ||
    !credit_cvv ||
    !cart ||
    !invoice_amt ||
    !invoice_tax ||
    !invoice_total
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Parse cart into product IDs
    const productIds = cart.split(',').map(Number);
    if (productIds.some(isNaN)) {
      return res.status(400).json({ error: 'Invalid cart format.' });
    }

    // Verify that all product IDs exist in the database
    const products = await prisma.product.findMany({
      where: { product_id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found.' });
    }

    // Map product IDs to quantities
    const productQuantities = {};
    for (const id of productIds) {
      productQuantities[id] = (productQuantities[id] || 0) + 1;
    }

    // Create a new purchase
    const purchase = await prisma.purchase.create({
      data: {
        customer_id: req.session.user.customer_id,
        street,
        city,
        province,
        country,
        postal_code,
        credit_card,
        credit_expire,
        credit_cvv,
        invoice_amt: parseFloat(invoice_amt), // Convert to float
        invoice_tax: parseFloat(invoice_tax), // Convert to float
        invoice_total: parseFloat(invoice_total), // Convert to float
        order_date: new Date(),
      },
    });

    // Create purchase items
    const purchaseItems = Object.entries(productQuantities).map(
      ([product_id, quantity]) => ({
        purchase_id: purchase.purchase_id,
        product_id: Number(product_id),
        quantity,
      })
    );

    await prisma.purchaseItem.createMany({ data: purchaseItems });

    return res.status(201).json({ message: 'Purchase completed successfully.' });
  } catch (error) {
    console.error('Error completing purchase:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
