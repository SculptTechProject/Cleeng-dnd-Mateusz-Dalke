# Cleeng DND Decision Service (Express + TypeScript) <br> by [Mateusz Dalke](https://github.com/SculptTechProject)

A minimal HTTP service that decides whether to send a user notification based on event type and a Do‑Not‑Disturb (DND) window. Built with Express, TypeScript, and zero database (in‑memory store).

---

## Highlights

- **Single responsibility**: decide `PROCESS_NOTIFICATION` vs `DO_NOT_NOTIFY`.
- **DND window**: supports normal windows (e.g., 22:00–23:00) and ones **crossing midnight** (e.g., 22:00–07:00).
- **In‑memory preferences**: no persistence (acceptable for the assignment).
- **Strict validation**: Zod schemas for inputs; returns `400` on invalid payloads.
- **Tested**: unit (DND logic) + integration (endpoints) via Vitest + Supertest.
- **ESM / NodeNext**: explicit `.js` extensions in relative imports.

---

## Configuration

Enviroment variables:

- `PORT` - server port (default `3000`)
- `API_PREFIX` - base path prefix (default (/api/v1).
  _Leave empty to expose unprefixed routes (`/preferences`, `/events`)_

Example `.env`:

```bash
PORT 3000
# API base path prefix. Defaults to /api/v1 when unset.
# Leave empty to expose unprefixed routes:
# API_PREFIX=
API_PREFIX=/api/v1
```

---

## API (v1)

Base URL (dev): `http://localhost:3000`

### Set Preferences

`POST /api/v1/preferences/:userId`

> This documentation uses `/api/v1` in examples.

**Body**

```json
{
  "dnd": { "start": "22:00", "end": "07:00" },
  "eventSettings": {
    "item_shipped": { "enabled": true },
    "invoice_generated": { "enabled": false }
  }
}
```

**Responses**

- `200 { "ok": true }`
- `400 { "error": "BAD_PREFERENCES", "details": { ...zodFlatten } }`

### Get Preferences

`GET /api/v1/preferences/:userId`

**Responses**

- `200 { "dnd": { ... }, "eventSettings": { ... } }`
- `404 { "error": "NO_PREFERENCES" }`

### Decision Endpoint

`POST /api/v1/events`

**Body**

```json
{
  "eventId": "e1",
  "userId": "u1",
  "eventType": "item_shipped",
  "timestamp": "2025-08-28T08:15:00+02:00" // ISO 8601 with timezone offset
}
```

**Responses**

- `202 { "decision": "PROCESS_NOTIFICATION" }`
- `202 { "decision": "PROCESS_NOTIFICATION", "reason": "NO_PREFERENCES_DEFAULT_ALLOW" }` (when user has no preferences)
- `200 { "decision": "DO_NOT_NOTIFY", "reason": "USER_UNSUBSCRIBED_FROM_EVENT" }`
- `200 { "decision": "DO_NOT_NOTIFY", "reason": "DND_ACTIVE" }`
- `400 { "error": "BAD_EVENT", "details": { ...zodFlatten } }`

**Rules**

- If **no preferences** for the user → allow processing (202) with `reason`.
- If event type is configured with `{ enabled: false }` → skip (200) with reason.
- If the event timestamp falls **within** DND → skip (200) with reason.
- Otherwise → process (202).

---

## DND Semantics

- Input format: `HH:MM` (24h).
- Boundaries: **start inclusive**, **end exclusive**.
  - Example (22:00–23:00): `22:00` blocked, `23:00` allowed.
- Midnight:
  - If `start < end` → standard window (same day).
  - If `start > end` → window **crosses midnight**; times are blocked when `t ≥ start` **or** `t < end`.
- `start === end` → treated as **no DND** (zero-length window).
- DND checks use the **local clock from the event’s ISO timestamp** (HH:MM part); the timezone offset in ISO is ignored for the DND calculation beyond extracting HH:MM.

---

## Project Structure

```
src/
  app.ts              # Express app (mounted routes)
  index.ts            # Process entrypoint (starts server)
  domain/types.ts     # Zod schemas & types
  lib/dnd.ts          # DND helpers (parse, isWithinDnd)
  data/store.ts       # In-memory Map<string, Preferences>
  routes/
    preferences.ts    # GET/POST preferences
    events.ts         # POST decision endpoint
  middlewares/        # validate/loadPrefs/guards
src/tests/
  dnd.test.ts         # unit tests for DND
  event.test.ts       # integration tests for /events
```

---

## Local Development

**Requirements**: Node 20+

```bash
npm i
npm run dev
# Healthcheck
curl localhost:3000/health
```

Build & run (prod-like):

```bash
npm run build
npm start
```

### Testing

```bash
npm run test       # CI mode
npm run test:watch # local TDD
```
---

## Docker

**Production image** (multi‑stage): see `Dockerfile`.

```bash
docker compose up --build
curl localhost:3000/health
```

---

## Continuous Integration (GitHub Actions)

Minimal pipeline:

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test
        env:
          NODE_ENV: test
```

---

## Example Requests

Set preferences:

```bash
curl -X POST http://localhost:3000/api/v1/preferences/u1 \
  -H "Content-Type: application/json" \
  -d '{
    "dnd": {"start": "22:00", "end": "07:00"},
    "eventSettings": {
      "item_shipped": {"enabled": true},
      "invoice_generated": {"enabled": false}
    }
  }'
```

Event blocked by DND:

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "e3",
    "userId": "u1",
    "eventType": "item_shipped",
    "timestamp": "2025-08-28T01:30:00+02:00"
  }'
# → 200 { "decision": "DO_NOT_NOTIFY", "reason": "DND_ACTIVE" }
```

Event allowed (no preferences):

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "e1",
    "userId": "uX",
    "eventType": "item_shipped",
    "timestamp": "2025-08-28T10:00:00+02:00"
  }'
# → 202 { "decision": "PROCESS_NOTIFICATION", "reason": "NO_PREFERENCES_DEFAULT_ALLOW" }
```

---

## Implementation Notes

- Runtime entrypoint: `src/index.ts`. Express app (for tests): `src/app.ts`.
- ESM/NodeNext: use `.js` in **relative** imports (TypeScript transpiles to `.js`).
- Default policy: **no prefs → allow** with `reason`.
- Keep the in‑memory store simple (`Map<string, Preferences>`); losing state on restart is expected.

---

## License

MIT

