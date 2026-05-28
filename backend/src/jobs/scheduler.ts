import cron from "node-cron";

import { runDemandForecastSweep } from "./tasks/demandForecast";
import { runExpiryDiscountSweep } from "./tasks/expiryDiscount";

export function scheduleJobs() {
  cron.schedule("*/30 * * * *", async () => {
    await runExpiryDiscountSweep();
  });

  cron.schedule("0 */4 * * *", async () => {
    await runDemandForecastSweep();
  });
}
