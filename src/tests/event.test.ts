import request from "supertest";
import { describe, it, beforeEach, expect } from "vitest";
import app from "../app.js";
import store from "../data/store.js";

// Safe joining to avoid double slashes
const API_PREFIX = (process.env.API_PREFIX ?? "/api/v1").replace(/\/$/, "");

// helper to prefix paths
const P = (p: string) => `${API_PREFIX}${p}`;

describe("POST /events", () => {
  beforeEach(() => {
    store.clear();
  });

  it("NO_PREFERENCES → PROCESS 202", async () => {
    const res = await request(app).post(P("/events")).send({
      eventId: "e1",
      userId: "uX",
      eventType: "item_shipped",
      timestamp: "2025-08-28T10:00:00+02:00",
    });
    expect(res.status).toBe(202);
    expect(res.body.decision).toBe("PROCESS_NOTIFICATION");
    expect(res.body.reason).toBe("NO_PREFERENCES_DEFAULT_ALLOW");
  });

  it("event disabled → SKIP 200 USER_UNSUBSCRIBED_FROM_EVENT", async () => {
    await request(app)
      .post(P("/preferences/u1"))
      .send({
        dnd: { start: "22:00", end: "07:00" },
        eventSettings: { invoice_generated: { enabled: false } },
      });

    const res = await request(app).post(P("/events")).send({
      eventId: "e2",
      userId: "u1",
      eventType: "invoice_generated",
      timestamp: "2025-08-28T12:00:00+02:00",
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      decision: "DO_NOT_NOTIFY",
      reason: "USER_UNSUBSCRIBED_FROM_EVENT",
    });
  });

  it("DND active → SKIP 200 DND_ACTIVE", async () => {
    await request(app)
      .post(P("/preferences/u1"))
      .send({
        dnd: { start: "22:00", end: "07:00" },
        eventSettings: { item_shipped: { enabled: true } },
      });

    const res = await request(app).post(P("/events")).send({
      eventId: "e3",
      userId: "u1",
      eventType: "item_shipped",
      timestamp: "2025-08-28T01:30:00+02:00",
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      decision: "DO_NOT_NOTIFY",
      reason: "DND_ACTIVE",
    });
  });

  it("outside DND and enabled → PROCESS 202", async () => {
    await request(app)
      .post(P("/preferences/u1"))
      .send({
        dnd: { start: "22:00", end: "07:00" },
        eventSettings: { item_shipped: { enabled: true } },
      });

    const res = await request(app).post(P("/events")).send({
      eventId: "e4",
      userId: "u1",
      eventType: "item_shipped",
      timestamp: "2025-08-28T08:15:00+02:00",
    });
    expect(res.status).toBe(202);
    expect(res.body.decision).toBe("PROCESS_NOTIFICATION");
  });
});
