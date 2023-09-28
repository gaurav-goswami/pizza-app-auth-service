import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
  const PORT = Config.PORT;
  try {
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

startServer();
