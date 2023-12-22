import { Config } from ".";
import { Roles } from "../constants";
import { User } from "../entity/User";
import { AppDataSource } from "./data-source";
import logger from "./logger";
import bcrypt from "bcryptjs";

const createAdminUser = async () => {
  logger.info("Request to create an Admin User");
  const { ADMIN_FIRSTNAME, ADMIN_LASTNAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
    Config;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const admin = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });

    if (admin) {
      logger.error("Admin user already exists");
      return;
    }

    const salt_round = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD!, salt_round);

    await userRepo.save({
      firstName: ADMIN_FIRSTNAME,
      lastName: ADMIN_LASTNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Roles.ADMIN,
    });
    logger.info("Admin user created");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return;
  }
};

export default createAdminUser;
