import { sendError } from "../utils/apiResponse.js";

/**
 * Validates request schema using Zod
 * @param {import("zod").ZodSchema} schema
 * @param {"body" | "query" | "params"} source
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const formattedErrors = parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return sendError(res, "Validation failed", 400, formattedErrors);
      }
      req[source] = parsed.data;
      next();
    } catch (error) {
      return sendError(res, "Validation error", 400, error.message);
    }
  };
};
