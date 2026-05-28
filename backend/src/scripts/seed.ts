import bcrypt from "bcrypt";
import { PrismaClient, UserRole, PaymentMethod, OrderStatus, DeliveryStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@neighbourhood.local" },
    update: {},
    create: {
      email: "admin@neighbourhood.local",
      name: "Admin User",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@store.local" },
    update: {},
    create: {
      email: "owner@store.local",
      name: "FreshMart Owner",
      passwordHash,
      role: UserRole.OWNER,
      latitude: 13.0604,
      longitude: 80.2496,
      addressLine1: "363 Arcot Road",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600024"
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.local" },
    update: {},
    create: {
      email: "customer@demo.local",
      name: "Demo Customer",
      passwordHash,
      role: UserRole.CUSTOMER,
      latitude: 13.0586,
      longitude: 80.2345,
      addressLine1: "Kodambakkam High Road",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600024"
    }
  });

  const delivery = await prisma.user.upsert({
    where: { email: "delivery@demo.local" },
    update: {},
    create: {
      email: "delivery@demo.local",
      name: "Delivery Associate",
      passwordHash,
      role: UserRole.DELIVERY
    }
  });

  const store = await prisma.store.upsert({
    where: { id: "seed-store" },
    update: {},
    create: {
      id: "seed-store",
      name: "FreshMart Grocery",
      description: "Neighbourhood grocery with dynamic pricing",
      ownerId: owner.id,
      addressLine1: "363 Arcot Road",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600024",
      latitude: 13.0604,
      longitude: 80.2496,
      deliveryRadiusKm: 8,
      minOrderValue: 200
    }
  });

  const products = await prisma.product.createMany({
    data: [
      {
        sku: "MILK-500",
        name: "Aavin Milk 500ml",
        category: "Dairy",
        basePrice: 28,
        shelfLifeDays: 5
      },
      {
        sku: "BREAD-WHT",
        name: "Fresh White Bread",
        category: "Bakery",
        basePrice: 40,
        shelfLifeDays: 3
      },
      {
        sku: "TOMATO-1KG",
        name: "Tomato 1kg",
        category: "Produce",
        basePrice: 32,
        shelfLifeDays: 7
      }
    ],
    skipDuplicates: true
  });

  const productRecords = await prisma.product.findMany();

  await prisma.inventoryItem.createMany({
    data: productRecords.map((product, index) => ({
      storeId: store.id,
      productId: product.id,
      quantity: 50 - index * 10,
      dynamicPrice: product.basePrice,
      expiryDate: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000)
    })),
    skipDuplicates: true
  });

  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer.id,
      status: OrderStatus.COMPLETED,
      paymentMethod: PaymentMethod.COD,
      subtotal: 400,
      discountTotal: 20,
      deliveryFee: 10,
      total: 390,
      deliveryAddress: "Kodambakkam High Road, Chennai",
      deliveryLatitude: 13.0586,
      deliveryLongitude: 80.2345
    }
  });

  const [milk, bread] = productRecords;

  if (milk && bread) {
    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order.id,
          productId: milk.id,
          quantity: 4,
          unitPrice: milk.basePrice,
          finalPrice: milk.basePrice.mul(4)
        },
        {
          orderId: order.id,
          productId: bread.id,
          quantity: 2,
          unitPrice: bread.basePrice,
          finalPrice: bread.basePrice.mul(2)
        }
      ]
    });
  }

  await prisma.deliveryAssignment.create({
    data: {
      orderId: order.id,
      deliveryStaffId: delivery.id,
      status: DeliveryStatus.ASSIGNED
    }
  });

  console.log("Seed data inserted", { admin: admin.email, owner: owner.email, customer: customer.email });
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
