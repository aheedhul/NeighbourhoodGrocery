export type UserRole = "CUSTOMER" | "OWNER" | "DELIVERY" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  addressLine1?: string;
};

export type StoreSummary = {
  id: string;
  name: string;
  distanceKm: number;
  minOrderValue: number;
  deliveryRadiusKm: number;
  city: string;
  state: string;
};

export type Store = {
  id: string;
  name: string;
  description?: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  minOrderValue: number;
};

export type Product = {
  id: string;
  name: string;
  category?: string;
  basePrice: number;
  imageUrl?: string;
};

export type InventoryItem = {
  id: string;
  storeId: string;
  productId: string;
  quantity: number;
  dynamicPrice: number;
  status: "AVAILABLE" | "LOW_STOCK" | "NEAR_EXPIRY" | "EXPIRED";
  expiryDate?: string;
  product: Product;
};

export type OrderItem = {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  expiryDate?: string;
};

export type Order = {
  id: string;
  storeId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";
  paymentMethod: "COD" | "ONLINE";
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt: string;
};

export type Recommendation = {
  inventoryId: string;
  productId: string;
  name: string;
  category?: string;
  dynamicPrice: number;
  basePrice: number;
  score: number;
  expiryDate?: string;
};
