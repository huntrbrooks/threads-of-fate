Threads of Fate — Mobile (Expo)

What this is
- Expo managed app targeting iOS/Android with a minimal 3-step wizard → seeded draw via your Next.js backend → renders reading.
- Local notifications scheduled based on timeframe (client only for v1; implement push via EAS/APNs/FCM later).
- Uses EXPO_PUBLIC_API_BASE to call your web `/api/reading`.

Quick start
1) Install Expo CLI: `npm i -g expo` (or use npx)
2) Install deps: `npm i`
3) Set API base in `app.json` under `extra.EXPO_PUBLIC_API_BASE` (use your LAN IP, e.g. `http://192.168.1.10:3000`)
4) Run: `npm start` → press i (iOS simulator) or a (Android emulator)

Notes
- Simulator cannot reach `localhost`; use your machine IP.
- Local notifications fire even with the app in background; for reliable scheduled reminders when the app is closed long-term, add push notifications.

Pro gating (dev)
- Deep spreads and some features are marked Pro. In this scaffold, tap "Unlock Pro" to simulate purchase (dev only).
- For production, integrate RevenueCat or native IAP and replace `src/lib/paywall.ts` with real purchase/restore logic.

Push (later)
- Add Expo push tokens via `expo-notifications` and register with your backend.
- Use EAS credentials to enable APNs/FCM. Create cron on server to send reminders on schedule.

IAP (later)
- For native compliance, use platform IAP for gating features. Consider `expo-in-app-purchases` or a provider like RevenueCat. Wire a paywall around deep spreads/export/reminders.

RevenueCat integration (outline)
- Create a project in RevenueCat; add iOS/Android apps; set products/entitlements (e.g., `pro`).
- Install `react-native-purchases` via EAS and configure API keys.
- On app start, configure Purchases with API key and app user id.
- Fetch offerings and present a package; call purchase; check `customerInfo.entitlements.active` for `pro`.
- Replace `src/lib/paywall.ts` with calls to Purchases to derive `isPro`, `purchasePro`, `restorePro`.
