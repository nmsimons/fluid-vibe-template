# Fluid Vibe Template

A minimal Fluid Framework starter focused on **vibe coding**: real-time collaboration plumbing (authentication, Fluid container bootstrapping, presence managers, undo stack) is ready, while complex UI is left for you to build.

---

## What you get

| Area             | Included       | Notes                                                                                    |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------- |
| Fluid container  | ✅             | `src/AppLoad.tsx` wires AzureClient/local Fluid Relay, SharedTree, and undo/redo stacks. |
| Schema           | ✅             | `appSchema.ts` defines app metadata and collaborative shared notes. Extend it freely.    |
| Presence helpers | ✅             | Selection, drag, resize, cursor, ink, and user managers under `src/presence/`.           |
| Authentication   | ✅             | MSAL setup plus `AuthContext` for downstream token needs.                                |
| UI               | 🧭 header only | Fluent UI header with onboarding callouts—no canvas, tables, or toolbar.                 |
| Tests            | ✅             | Playwright smoke test validates the scaffold boots correctly.                            |

Removed directories (`canvas/`, `toolbar/`, `items/`, `panels/`, `overlays/`, etc.) are gone so you start clean.

---

## Repo layout

```text
src/
├── AppLoad.tsx          # Loads Fluid container and renders ReactApp
├── schema/
│   ├── appSchema.ts     # Minimal SharedTree schema definition
│   └── containerSchema.ts
├── react/
│   ├── components/app/  # Header + onboarding callouts
│   ├── contexts/        # Auth, presence, pane, table
│   └── hooks/           # useTree, keyboard shortcuts, account selector, etc.
├── presence/            # Managers built on @fluidframework/presence
├── infra/               # Auth + Fluid helpers
└── undo/undo.ts         # Undo/redo stack wiring
```

---

## Quick start

1. Install dependencies:

    ```powershell
    npm install
    ```

2. Start a local Fluid relay (new PowerShell window):

    ```powershell
    npm run start:server
    ```

3. Launch the template:

    ```powershell
    npm start
    ```

    Optional variants:

    ```powershell
    npm run dev:azure   # hosted relay
    npm run dev:local   # local client + server
    npm run dev:network # bind to LAN IP
    ```

Open [http://localhost:5173](http://localhost:5173) to see the header and onboarding guidance. Connect multiple browsers to watch presence updates.

---

## Extending the template

- **Model data:** edit `src/schema/appSchema.ts` with new `sf.object` classes and `createInitialAppState()` defaults.
- **Read/write tree:** use `useTree()` to subscribe to SharedTree updates in your components.
- **Leverage presence:** consume `PresenceContext` and the managers you need (selection, drag, ink, cursor, resize, users).
- **Build UI:** create components under `src/react/components/` and hook them up to schema + presence.
- **Test:** extend `test/App.test.ts` or add more Playwright/Vitest coverage.

---

## Authentication

- `src/react/contexts/AuthContext.tsx` exposes MSAL authentication state.
- `src/infra/auth.ts` contains sign-in/out helpers.
- Update `staticwebapp.config.json` and environment settings when wiring a real Azure AD app.

---

## Presence toolkit highlights

| Helper                                                                  | Purpose                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `createUsersManager`                                                    | Track collaborators and display avatars.                |
| `createTypedSelectionManager`                                           | Synchronize multi-selection state.                      |
| `createDragManager` / `createResizeManager`                             | Broadcast in-flight drag/resize operations.             |
| `createCursorManager` / `createInkPresenceManager`                      | Share cursor positions and ink strokes.                 |
| `useEventSubscription`, `useSelectionSync`, `useMultiTypeSelectionSync` | Hooks that connect React components to presence events. |

All helpers are optional—pick the ones that fit your scenario.

---

## Undo/redo

`src/undo/undo.ts` provides `createUndoRedoStacks(events)` to manage undo/redo for SharedTree operations. `AppLoad.tsx` wires it into the app shell; reuse it inside your own components as needed.

---

## Testing & linting

```powershell
npm run lint        # eslint flat config
npm test            # Playwright smoke test
npm run compile     # Type check via tsc --build
npm run build       # Production Vite bundle
```

---

## Tailwind CSS

- `src/index.css` holds the Tailwind directives and any custom layers.
- `src/output.css` is the compiled artifact committed to the repo so the app loads Tailwind styles without a build.
- Rebuild the compiled CSS after changing `index.css`:

    ```powershell
    npm run tailwind:watch
    ```

- When you just need a one-off build:

    ```powershell
    npm run tailwind:build
    ```

- Prefer the underlying CLI? It maps 1:1 to `@tailwindcss/cli -i ./src/index.css -o ./src/output.css`.

---

## Next steps

- Design your collaborative UI (canvas, boards, dashboards, etc.).
- Expand the SharedTree schema with domain-specific data.
- Add presence visualizations (cursors, pins, overlays) tailored to your experience.
- Integrate Microsoft Graph or other APIs using the existing auth flow.

Have fun vibe coding! ⚡
