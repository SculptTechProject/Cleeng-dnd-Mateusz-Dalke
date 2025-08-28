/*
 * Middleware to validate request body against a Zod schema
 */
import type { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, key: string) {
  return (req: any, res: any, next: any) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "BAD_INPUT", details: parsed.error.flatten() });
    }
    res.locals[key] = parsed.data; // store parsed data in res.locals
    next();
  };
}
