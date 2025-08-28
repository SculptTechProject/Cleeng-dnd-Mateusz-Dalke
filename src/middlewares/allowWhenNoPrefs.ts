/*
 *    Middleware to allow processing the / 
 *    notification when no user preferences are found.
 *    This middleware should be used after loadPrefs middleware.
 */
export function allowWhenNoPrefs(_req: any, res: any, next: any) {
  if (res.locals.noPrefs) {
    return res.status(202).json({
      decision: "PROCESS_NOTIFICATION",
      reason: "NO_PREFERENCES_DEFAULT_ALLOW",
    });
  }
  next();
}
