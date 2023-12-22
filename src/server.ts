import app from "./app";
import { Config } from "./config";
import createAdminUser from "./config/admin";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully.");
    await createAdminUser();
    app.listen(PORT, () => {
      logger.info(`Server is running at PORT ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`ERROR: ${error.message}`);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

void startServer();
