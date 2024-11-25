const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session || !req.session.customer_id) {
      return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
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

    // Validate all fields are present
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

    // Parse the cart
    const cartItems = cart.split(',').map(Number);
    if (!cartItems.every(Number.isInteger)) {
      return res.status(400).json({ error: 'Invalid cart format.' });
    }

    // Insert into Purchase table
    const purchase = await prisma.purchase.create({
      data: {
        customer_id: req.session.customer_id,
        street,
        city,
        province,
        country,
        postal_code,
        credit_card,
        credit_expire,
        credit_cvv,
        invoice_amt: parseFloat(invoice_amt),
        invoice_tax: parseFloat(invoice_tax),
        invoice_total: parseFloat(invoice_total),
        order_date: new Date(),
      },
    });

    // Insert into PurchaseItem table
    const purchaseItems = cartItems.map((product_id) => ({
      purchase_id: purchase.purchase_id,
      product_id,
      quantity: cartItems.filter((id) => id === product_id).length,
    }));

    // Ensure unique product entries for the composite key
    const uniqueItems = Object.values(
      purchaseItems.reduce((acc, item) => {
        acc[item.product_id] = acc[item.product_id] || { ...item, quantity: 0 };
        acc[item.product_id].quantity += item.quantity;
        return acc;
      }, {})
    );

    await prisma.purchaseItem.createMany({ data: uniqueItems });

    // Response
    return res.status(200).json({ message: 'Purchase completed successfully.', purchase });
  } catch (error) {
    console.error('Error completing purchase:', error);
    return res.status(500).json({ error: 'An error occurred while completing the purchase.' });
  }
});

module.exports = router;
