import dotenv from "dotenv";

dotenv.config();

type AppConfig = {
  port: number;
  jwtSecret: string;
  minNearExpiryDays: number;
  nearExpiryDiscounts: Array<{ threshold: number; discount: number }>;
};

const config: AppConfig = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "development_secret",
  minNearExpiryDays: Number(process.env.MIN_NEAR_EXPIRY_DAYS ?? 5),
  nearExpiryDiscounts: [
    { threshold: 1, discount: 0.4 },
    { threshold: 3, discount: 0.2 },
    { threshold: 5, discount: 0.1 }
  ]
};

export default config;
