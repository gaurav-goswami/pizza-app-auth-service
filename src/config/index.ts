import { config } from "dotenv";
config();

const { PORT } = process.env;
const { NODE_ENV } = process.env;
export const Config = {
  PORT,
  NODE_ENV,
};
