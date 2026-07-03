const REQUIRED_ENV_VARS = ["JWT_SECRET", "MONGODB_URI"];

export const getJwtSecret = () => process.env.JWT_SECRET;

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. Add them to your backend hosting environment and redeploy.`
    );
  }
};
