Threads of Fate — LLM Prompt Bundle and Utilities

What’s included
- Typed interfaces and enums for inputs/outputs (`src/types.ts`).
- Intent → spread selector (`src/lib/spreads.ts`) with `pickSpread(intent, depth)`.
- Majors card dictionary and suit energies (`src/lib/cards.ts`).
- Seeded card draw + reader notes (`src/lib/draw.ts`).
- Prompt composer (system + instruction) (`src/lib/prompt.ts`).
- JSON repair + schema validation (`src/lib/jsonRepair.ts`, `src/lib/validate.ts`).
- Vendor-agnostic LLM runner (`src/lib/llm.ts`).
- Prepare helper to build full ReadingInput from minimal params (`src/lib/prepare.ts`).
- CLI to compose/call fixtures (`scripts/run-fixture.ts`).
- Five JSON fixtures for testing (`fixtures/*.json`).

Next.js API routes (Edge)
- `app/api/reading/route.ts`: POST to compose or run a reading.
  - Body: `{ mode?: "compose"|"run", input?: ReadingInput, prepare?: PrepareParams, llm?: { vendor?: "anthropic"|"openai", model?: string, temperature?: number, maxTokens?: number } }`
  - `compose` returns `{ system, instruction, input }`.
  - `run` calls the model and returns `{ output, jsonText, repaired, input }`.
- `app/api/repair/route.ts`: POST `{ text: string, validate?: boolean }` to repair/validate JSON.

Run dev server
- Install deps: `pnpm i` (or `npm i`, `yarn`)
- Dev: `pnpm dev`
- Call: `curl -X POST http://localhost:3000/api/reading -H 'content-type: application/json' -d '{"mode":"compose","input": <ReadingInput JSON>}'`

Docker
- Build: `docker build -t tof .`
- Run: `docker run -it --rm -p 3000:3000 -e LLM_VENDOR=anthropic -e ANTHROPIC_API_KEY=sk-... tof`

Env vars
- `LLM_VENDOR=anthropic|openai`
- `LLM_MODEL` (optional)
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as needed
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client auth/persistence
- `SUPABASE_SERVICE_ROLE_KEY` (server-only) for account deletion endpoint
- `CRON_SECRET` to authorize `/api/cron/reminders` for push delivery

Notes
- Depth currently maps to: `quick` → Classic Three; `standard`/`deep` → the intent’s canonical spread. Use `style.depth` to tune model verbosity.
- Card art is not included. Deck names reference standard RWS-style names for development only.

Minimal usage (pseudo)
- Select spread: `const spread = pickSpread(input.intent, input.style.depth)`.
- Draw cards: `const { cards, notes } = drawCards({ seed, deck: 'RWS', positions: spread.positions.length, allowReversals: true })`.
- Compose prompts: `const { system, instruction } = composePrompt({ ...input, spread, deck: 'RWS', cards_drawn: cards, reader_notes: notes })`.

LLM call (optional)
- `const { output } = await runModel(input, { vendor: 'anthropic' | 'openai' })`.
- Env vars: `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY`. Optional: `LLM_VENDOR`, `LLM_MODEL`.

CLI
- Print prompt for a fixture: `node scripts/run-fixture.ts decision_clarity print`
- Call model (requires env): `LLM_VENDOR=anthropic ANTHROPIC_API_KEY=... node scripts/run-fixture.ts decision_clarity call`
-
Web UI (App Router)
- 3-step wizard collecting intent, focus (8–200 chars), timeframe, constraints, context, style, consent.
- Seeded draw via `/api/reading` with spread auto-selected by intent and `depth`.
- Reading renderer with positions, patterns, decision frame, actions, affirmation, cautions.
- Local save of last 3 readings; view details at `/reading/:id`; delete locally.
- Reminders: stores a `reminderAt` timestamp; optional browser notifications (when the site is open) and `.ics` download for calendar.
 - Pro gating: `/pro` page toggles a dev-only Pro flag; deep spreads, JSON export, calendar export, server push are marked Pro. A paywall modal appears when selecting Pro-only depth, and a dedicated plans page lives at `/paywall`.
 - Visual polish: Minimal SVG card thumbnails and hover keyword badges for drawn Majors/minors.

Reminder limitations
- Browsers do not support reliable long-term scheduled local notifications without a push service.
- This app provides: on-visit checks (fires notifications when due while page is open) and calendar (.ics) export.
Supabase (for App Store readiness)
- Schema: `supabase/schema.sql` (run in Supabase SQL editor). Enables per-user RLS on `readings`.
- Client: magic-link auth via `@supabase/supabase-js`; local session persistence.
- Sync: optional “Save to cloud” flow (you can wire `upsertReadingCloud` in the UI).
- Deletion: `POST /api/account/delete` with `Authorization: Bearer <access_token>` deletes all data and the account (required by Apple’s account deletion rule).

Guidelines impact
- Apple 3.1.1: use in-app purchases for digital features in native apps (plan for RN/Expo).
- Account deletion: expose in-app option; this route provides server capability once the user is authenticated.
- Privacy: Document data flows; include “Private Mode” toggle to avoid server storage.
Mobile app (Expo)
- Location: `apps/mobile`
- Uses `EXPO_PUBLIC_API_BASE` to reach this server’s `/api/reading`.
- Local notifications on device based on timeframe; push/APNs/FCM to be added for production.
- Push registration + server scheduling added: mobile registers Expo push token and schedules server-side reminder; set `extra.eas.projectId` in `apps/mobile/app.json` for real devices.
 - Paywall: RevenueCat integrated (react-native-purchases). Paywall modal fetches offerings and purchases a package; restore supported.

Push notifications (server)
- Endpoints:
  - `POST /api/push/register` { token, device_id? } → stores Expo push token
  - `POST /api/push/schedule` { token, due_at_iso, headline?, body? } → stores a scheduled reminder
  - `POST /api/cron/reminders` with header `x-cron-secret: $CRON_SECRET` → sends due reminders and marks them sent
- Supabase tables: `push_tokens`, `scheduled_reminders` (see `supabase/schema.sql`)
- Cron: Use Vercel Cron or Supabase Scheduled Tasks to call `/api/cron/reminders` on a cadence (e.g., every 5 minutes).
- IAP stubs planned: gate deep spreads/export/reminders in native.
