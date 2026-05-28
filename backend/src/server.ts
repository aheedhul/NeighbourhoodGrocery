import config from "./config/env";
import app from "./app";
import prisma from "./config/prisma";
import { scheduleJobs } from "./jobs/scheduler";

async function bootstrap() {
  try {
    await prisma.$connect();
    scheduleJobs();

    app.listen(config.port, () => {
      console.log(`API listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void bootstrap();
