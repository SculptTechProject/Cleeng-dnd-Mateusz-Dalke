/*
^ Unit tests for DND logic
*/
import { describe, it, expect } from "vitest";
import { isWithinDnd, parseHHMM, minutesFromIsoLocalTime } from "../lib/dnd.js";

describe("parseHHMM", () => {
  it("parses valid HH:MM", () => {
    expect(parseHHMM("00:00")).toBe(0);
    expect(parseHHMM("07:30")).toBe(450);
    expect(parseHHMM("23:59")).toBe(23 * 60 + 59);
  });
  it("throws on invalid format", () => {
    expect(() => parseHHMM("7:30")).toThrow();
    expect(() => parseHHMM("24:00")).toThrow();
    expect(() => parseHHMM("aa:bb")).toThrow();
  });
});

describe("minutesFromIsoLocalTime", () => {
  it("ignores timezone and extracts local HH:MM from ISO", () => {
    expect(minutesFromIsoLocalTime("2025-08-28T01:30:00+02:00")).toBe(90);
    expect(minutesFromIsoLocalTime("2025-08-28T23:00:00Z")).toBe(23 * 60);
  });
});

describe("isWithinDnd", () => {
  it("non-crossing window (22:00–23:00)", () => {
    const dnd = { start: "22:00", end: "23:00" };
    expect(isWithinDnd(dnd, "2025-08-28T21:59:00+02:00")).toBe(false);
    expect(isWithinDnd(dnd, "2025-08-28T22:00:00+02:00")).toBe(true);
    expect(isWithinDnd(dnd, "2025-08-28T22:59:59+02:00")).toBe(true);
    expect(isWithinDnd(dnd, "2025-08-28T23:00:00+02:00")).toBe(false);
  });

  it("window crossing midnight (22:00–07:00)", () => {
    const dnd = { start: "22:00", end: "07:00" };
    expect(isWithinDnd(dnd, "2025-08-28T21:00:00+02:00")).toBe(false);
    expect(isWithinDnd(dnd, "2025-08-28T22:00:00+02:00")).toBe(true);
    expect(isWithinDnd(dnd, "2025-08-29T02:00:00+02:00")).toBe(true);
    expect(isWithinDnd(dnd, "2025-08-29T07:00:00+02:00")).toBe(false);
  });

  it("start == end → treat as no DND", () => {
    const dnd = { start: "00:00", end: "00:00" };
    expect(isWithinDnd(dnd, "2025-08-28T00:00:00+02:00")).toBe(false);
    expect(isWithinDnd(dnd, "2025-08-28T12:34:00+02:00")).toBe(false);
  });
});
