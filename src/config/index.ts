import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env"), quiet: true });

export interface Config {
  apollo: {
    apiKey: string;
    baseUrl: string;
  };
  server: {
    port: number;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
  };
}

function validateConfig(): Config {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    throw new Error("APOLLO_API_KEY environment variable is required");
  }

  return {
    apollo: {
      apiKey,
      baseUrl: "https://api.apollo.io/api/v1",
    },
    server: {
      port: parseInt(process.env.MCP_SERVER_PORT || "8000", 10),
    },
    logging: {
      level: (process.env.LOG_LEVEL || "info") as Config["logging"]["level"],
    },
  };
}

export const config = validateConfig();