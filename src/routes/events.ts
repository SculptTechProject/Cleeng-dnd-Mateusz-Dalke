/*
 & Routes for handling event notifications
 */
import { Router } from "express";
import { EventPayloadSchema } from "../domain/types.js";
import { validate } from "../middlewares/validate.js";
import { loadPrefs } from "../middlewares/loadPrefs.js";
import { requireEventEnabled } from "../middlewares/requireEventEnabled.js";
import { blockWhenDndActive } from "../middlewares/blockWhenDndActive.js";
import { processNotification } from "../middlewares/processNotification.js";
import { allowWhenNoPrefs } from "../middlewares/allowWhenNoPrefs.js";

const r = Router();

r.post(
  "/",
  validate(EventPayloadSchema, "evt"),
  loadPrefs,
  allowWhenNoPrefs,
  requireEventEnabled,
  blockWhenDndActive,
  processNotification
);

export default r;
