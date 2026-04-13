import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const Config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  MAIL_SENDER_ADDRESS: process.env.MAIL_SENDER_ADDRESS,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
};
