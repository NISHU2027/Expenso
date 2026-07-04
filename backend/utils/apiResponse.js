import mongoose from "mongoose";

const isDbAuthError = (error) =>
  error?.code === 8000 ||
  error?.codeName === "AtlasError" ||
  /bad auth|authentication failed/i.test(error?.message ?? "");

const isDbUnavailable = (error) =>
  isDbAuthError(error) ||
  error?.name === "MongoServerSelectionError" ||
  error?.name === "MongooseError";

export const serverError = (res, error, context, message = "Server Error") => {
  console.error(`${context}:`, error);

  if (isDbUnavailable(error)) {
    return res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again later.",
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

export const invalidObjectId = (id, label) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return {
    success: false,
    message: `Invalid ${label} id`,
  };
};

export const parseTransactionInput = ({ description, amount, category, date }) => {
  if (!description || amount === undefined || !category || !date) {
    return {
      error: {
        success: false,
        message: "All fields are required",
      },
    };
  }

  const parsedAmount = Number(amount);
  const parsedDate = new Date(date);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return {
      error: {
        success: false,
        message: "Amount must be a valid positive number",
      },
    };
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      error: {
        success: false,
        message: "Date must be valid",
      },
    };
  }

  return {
    data: {
      description: description.trim(),
      amount: parsedAmount,
      category,
      date: parsedDate,
    },
  };
};
