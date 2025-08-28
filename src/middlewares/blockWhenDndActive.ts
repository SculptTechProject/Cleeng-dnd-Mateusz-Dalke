/*
 * Middleware to block notifications when DND (Do Not Disturb) is active
 */
import { isWithinDnd } from "../lib/dnd.js";

// if DND active, SKIP
export function blockWhenDndActive(req: any, res: any, next: any) {
  const { prefs, evt } = res.locals;
  if (!prefs) return next();
  if (isWithinDnd(prefs.dnd, evt.timestamp)) {
    return res
      .status(200)
      .json({ decision: "DO_NOT_NOTIFY", reason: "DND_ACTIVE" });
  }
  next();
}
