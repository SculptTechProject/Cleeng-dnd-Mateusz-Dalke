/*
 *    Middleware to check if the event type is enabled in user preferences.
 *    If not enabled, respond with DO_NOT_NOTIFY.
 */
export function requireEventEnabled(req: any, res: any, next: any) {
  const { prefs, evt } = res.locals;
  if (!prefs) return next(); // default allow without preferences
  const setting = prefs.eventSettings[evt.eventType];
  if (setting && !setting.enabled) {
    return res.status(200).json({
      decision: "DO_NOT_NOTIFY",
      reason: "USER_UNSUBSCRIBED_FROM_EVENT",
    });
  }
  next();
}
