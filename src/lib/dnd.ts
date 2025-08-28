/*
^ Functions to handle Do Not Disturb (DND) logic
*/
import type { z } from "zod";
import { DndSchema } from "../domain/types.js";

type Dnd = z.infer<typeof DndSchema>;

export function minutesFromIsoLocalTime(iso: string): number {
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (!m) throw new Error("Bad ISO time");
  const [, hh, mm] = m;
  return Number(hh) * 60 + Number(mm);
}

export function parseHHMM(s: string): number {
  // if there is no match, regex() in DndSchema would have rejected it already
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!m) throw new Error("Bad HH:MM");
  const [, hh, mm] = m;
  return Number(hh) * 60 + Number(mm);
}

export function isWithinDnd(dnd: Dnd, isoTimestamp: string): boolean {
  const t = minutesFromIsoLocalTime(isoTimestamp);
  const start = parseHHMM(dnd.start);
  const end = parseHHMM(dnd.end);

  if (start === end) return false; // No window at all
  if (start < end) return t >= start && t < end; // normal window (22–23)
  return t >= start || t < end; // overnight window (22–07)
}
