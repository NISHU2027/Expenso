const REQUIRED_ENV_VARS = ["JWT_SECRET", "MONGODB_URI"];
const VALID_NODE_ENVS = new Set(["development", "production", "test"]);

export const getJwtSecret = () => process.env.JWT_SECRET;

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]?.trim());
  const errors = [];

  if (missing.length > 0) {
    errors.push(`Missing required environment variable(s): ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters long");
  }

  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI.trim();

    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      errors.push("MONGODB_URI must start with mongodb:// or mongodb+srv://");
    }

    if (/[<>]/.test(uri)) {
      errors.push("MONGODB_URI contains angle brackets. Remove placeholder brackets and URL-encode special characters in the username/password");
    }

    const pathPart = uri.split("?")[0].split("/").slice(3).join("/");
    if (/\s/.test(pathPart)) {
      errors.push("MONGODB_URI database name contains spaces — use Tracker%20Expense or rename the database");
    }
  }

  if (process.env.PORT) {
    const port = Number(process.env.PORT);

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      errors.push("PORT must be a valid number between 1 and 65535");
    }
  }

  if (process.env.NODE_ENV && !VALID_NODE_ENVS.has(process.env.NODE_ENV)) {
    errors.push("NODE_ENV must be one of: development, production, test");
  }

  if (errors.length > 0) {
    throw new Error(`${errors.join("; ")}. Add valid values to your backend environment and redeploy.`);
  }
};
