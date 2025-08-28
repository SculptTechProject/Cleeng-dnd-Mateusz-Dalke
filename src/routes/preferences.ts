/*
 & Routes to get and set user preferences
 */
import { Router } from "express";
import store from "../data/store.js";
import { PreferencesSchema } from "../domain/types.js";
import { validate } from "../middlewares/validate.js";

const r = Router();

r.get("/:userId", (req, res) => {
  const p = store.get(req.params.userId);
  if (!p) return res.status(404).json({ error: "NO_PREFERENCES" });
  res.json(p);
});

r.post("/:userId", validate(PreferencesSchema, "prefs"), (req, res) => {
  store.set(req.params.userId, res.locals.prefs);
  res.json({ ok: true });
});

export default r;
