/*
 ^    Domain types and validation schemas using Zod
 */
import { z } from "zod";

/** HH:MM in 24h */
export const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DndSchema = z.object({
  start: z.string().regex(HHMM, "HH:MM"),
  end: z.string().regex(HHMM, "HH:MM"),
});

export const EventSettingsSchema = z.record(
  z.string(),
  z.object({ enabled: z.boolean() })
);

export const PreferencesSchema = z.object({
  dnd: DndSchema,
  eventSettings: EventSettingsSchema, // e.g. {"item_shipped": {enabled:true}}
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const EventPayloadSchema = z.object({
  eventId: z.string().min(1),
  userId: z.string().min(1),
  eventType: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;
