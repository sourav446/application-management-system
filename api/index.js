import dotenv from "dotenv";
import app from "../server/src/app.js";
import connectDB from "../server/src/config/db.js";

dotenv.config();

let isReady = false;

const ensureAppReady = async () => {
  if (isReady) {
    return;
  }

  await connectDB();
  isReady = true;
};

export default async function handler(req, res) {
  await ensureAppReady();
  return app(req, res);
}
