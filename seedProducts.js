// seedProducts.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProducts() {
  const products = [
    { name: 'Nestle Pure Life', description: 'It is a bottle of water... one of them at least.', cost: 1.28, image_filename: 'nestlepic.png' },
    { name: 'Fiji Water', description: 'A bottle of water. The expensive version!', cost: 2.89, image_filename: 'fijipic.png' },
    { name: 'Evian', description: 'One of the bottles of water, but French.', cost: 2.19, image_filename: 'evianpic.png' },
    { name: 'Voss', description: 'Water but in an awesome container.', cost: 2.40, image_filename: 'vosspic.png' },
    { name: 'Smart Water', description: 'If the water is so smart... why is it stuck in a bottle?', cost: 2.48, image_filename: 'smartpic.png' },
    { name: 'Dasani', description: 'Nickel water. Ranked 2nd worst water in the world only being beat by Florida tap water.', cost: 1.75, image_filename: 'dasanipic.png' },
    { name: 'Aquafina', description: 'In a positive note, it is not Dasani.', cost: 1.25, image_filename: 'aquafinapic.png' },
    { name: 'Flow', description: 'In a box.', cost: 2.20, image_filename: 'flowpic.png' },
    { name: 'LIFEWTR', description: 'Many are not aware this bottled water is owned by Pepsi.', cost: 2.38, image_filename: 'lifewtrpic.png' },
    { name: 'Acqua di Cristallo Tributo a Modigliani', description: 'I\'m so serious, that\'s genuinely the price. Yes, it\'s still water.', cost: 60000.00, image_filename: 'expensivewater.png' },
  ];

  // Insert each product into the database
  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('10 products inserted successfully!');
}

seedProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
