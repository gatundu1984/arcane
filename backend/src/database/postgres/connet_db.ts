import { drizzle } from "drizzle-orm/node-postgres";
import { ICONS } from "../../constants/icons";

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

export async function connectDb(maxRetries = 5) {
  if (maxRetries === 0) maxRetries = 5;

  let retries = 1;
  while (retries <= maxRetries) {
    try {
      await db.execute("select 1");
      console.log(`${ICONS.SUCCESS} Database connected successfully`);
      return;
    } catch (err) {
      console.error(
        `${ICONS.FAILED} Attempt ${retries}/${maxRetries} -- failed to connect to database:`,
        err instanceof Error ? err.message : err
      );

      if (retries === maxRetries) {
        console.error(
          `${ICONS.FAILED} All ${maxRetries} connection attempts failed. Could not establish database connection.`
        );
        throw err;
      }

      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      console.log(`Waiting ${delay / 1000}s before next retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
    }
  }
}
