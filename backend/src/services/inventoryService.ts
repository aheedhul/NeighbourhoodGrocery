import { InventoryStatus, Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

import prisma from "../config/prisma";
import { computeDiscountForExpiry, calculateDynamicPrice } from "../utils/pricing";
import config from "../config/env";
import { serializeInventoryItem } from "../utils/serializers";

export async function getStoreInventory(storeId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { storeId },
    include: { product: true },
    orderBy: { updatedAt: "desc" }
  });

  return items.map((item: (typeof items)[number]) => serializeInventoryItem(item));
}

type UploadSummary = {
  createdInventory: number;
  updatedInventory: number;
  newCatalogItems: number;
  rowsProcessed: number;
  errors: string[];
};

type RowDto = {
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  quantity?: number;
  expiryDate?: Date;
};

function normalizeRow(row: any): RowDto {
  const parsed: RowDto = {};
  if (row.SKU) parsed.sku = String(row.SKU).trim();
  if (row.Name) parsed.name = String(row.Name).trim();
  if (row.Description) parsed.description = String(row.Description);
  if (row.Category) parsed.category = String(row.Category);
  if (row.BasePrice !== undefined && row.BasePrice !== null && row.BasePrice !== "") {
    parsed.basePrice = Number(row.BasePrice);
  }
  if (row.Quantity !== undefined && row.Quantity !== null && row.Quantity !== "") {
    parsed.quantity = Number(row.Quantity);
  }
  if (row.ExpiryDate) parsed.expiryDate = new Date(row.ExpiryDate);
  return parsed;
}

export async function processInventoryUpload(storeId: string, buffer: Buffer, fileName: string): Promise<UploadSummary> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheet];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  const summary: UploadSummary = {
    createdInventory: 0,
    updatedInventory: 0,
    newCatalogItems: 0,
    rowsProcessed: 0,
    errors: []
  };

  for (const rawRow of rows) {
    summary.rowsProcessed += 1;
    const row = normalizeRow(rawRow);

    if (!row.name) {
      summary.errors.push("Row missing product name");
      continue;
    }

    let product = await prisma.product.findFirst({
      where: {
        OR: [{ sku: row.sku ?? "" }, { name: row.name }]
      }
    });

    if (product) {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          sku: row.sku ?? product.sku,
          name: row.name,
          description: row.description,
          category: row.category,
          basePrice: row.basePrice ? new Prisma.Decimal(row.basePrice) : product.basePrice
        }
      });
    } else {
      product = await prisma.product.create({
        data: {
          sku: row.sku,
          name: row.name,
          description: row.description,
          category: row.category,
          basePrice: row.basePrice ? new Prisma.Decimal(row.basePrice) : new Prisma.Decimal(0)
        }
      });
      summary.newCatalogItems += 1;
    }

    const existingInventory = await prisma.inventoryItem.findFirst({
      where: {
        storeId,
        productId: product.id,
        expiryDate: row.expiryDate ?? undefined
      }
    });

    const discount = row.expiryDate
      ? computeDiscountForExpiry(
          Math.ceil((row.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          config.nearExpiryDiscounts
        )
      : 0;

    const dynamicPrice = calculateDynamicPrice(Number(product.basePrice), 0, discount);

    if (existingInventory) {
      await prisma.inventoryItem.update({
        where: { id: existingInventory.id },
        data: {
          quantity: row.quantity ?? existingInventory.quantity,
          expiryDate: row.expiryDate ?? existingInventory.expiryDate,
          dynamicPrice
        }
      });
      summary.updatedInventory += 1;
    } else {
      await prisma.inventoryItem.create({
        data: {
          storeId,
          productId: product.id,
          quantity: row.quantity ?? 0,
          expiryDate: row.expiryDate,
          batchCode: row.sku ?? undefined,
          dynamicPrice,
          status: InventoryStatus.AVAILABLE
        }
      });
      summary.createdInventory += 1;
    }
  }

  await prisma.excelUpload.create({
    data: {
      storeId,
      fileName,
      summary: JSON.stringify(summary)
    }
  });

  return summary;
}

export async function getExpiryAlerts(storeId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      storeId,
      status: {
        in: ["NEAR_EXPIRY", "EXPIRED"]
      }
    },
    include: { product: true },
    orderBy: { expiryDate: "asc" }
  });

  return items.map((item: (typeof items)[number]) => serializeInventoryItem(item));
}

export async function listStoreProductsForCustomers(storeId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      storeId,
      quantity: { gt: 0 },
      status: {
        not: "EXPIRED"
      }
    },
    include: { product: true },
    orderBy: { dynamicPrice: "asc" }
  });

  return items.map((item: (typeof items)[number]) => serializeInventoryItem(item));
}
