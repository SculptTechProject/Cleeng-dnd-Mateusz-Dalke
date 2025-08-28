/*
 * Middleware to load user preferences from in-memory store
 */
import store from "../data/store.js";

export function loadPrefs(req: any, res: any, next: any) {
  const userId = res.locals.evt?.userId ?? req.params.userId;
  const prefs = userId ? store.get(userId) : undefined;
  res.locals.prefs = prefs;
  res.locals.noPrefs = !prefs; // flag to indicate absence of preferences
  next();
}
