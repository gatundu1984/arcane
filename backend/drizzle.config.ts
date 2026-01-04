/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/database/postgres/migrations",
  schema: "./src/database/postgres/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URl!,
  },
});
