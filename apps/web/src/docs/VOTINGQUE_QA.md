# Voting Questionnaire Q&A

## How does the component load questions on first render?
On mount it reads `localStorage.getItem("questions")`. If nothing valid is found (missing or `"undefined"`), it seeds state with `apiQuestion` and writes that array into `localStorage`.

## What happens if stored data is corrupted JSON?
The `try/catch` around `JSON.parse` falls back to `apiQuestion` and overwrites local storage with the default questions to keep the UI usable.

## How are rating selections persisted across refreshes?
Every time `questions` state changes, an effect serializes the array back into `localStorage` under the `questions` key. Reloading will rehydrate from that saved data, so ratings stay intact.

## How does a user set a rating?
Clicking a rating pill calls `handleRating`, which maps over the `questions` array and replaces only the matching item’s `rating` property with the chosen value.

## Why is there a guard in `handleRating`?
It returns early if `questions` is not yet populated, preventing updates before initial hydration completes.

## What rating scale is supported?
`rate` is a fixed array `[1, 2, 3, 4, 5]`, so users can choose any integer from 1 to 5.

## How is the current question tracked?
`currentQuestion` state holds the active index, initialized to `0`. Navigation buttons increment or decrement it.

## How are navigation boundaries enforced?
The Prev button is disabled when `currentQuestion === 0`; Next is disabled when `currentQuestion === questions?.length - 1`, preventing out-of-range access.

## What UI feedback indicates a selected rating?
The active rating pill uses `bg-blue-500`; unselected pills use `bg-white/10`, with hover transitions for clarity.

## What happens if `questions` is temporarily undefined?
Optional chaining (`questions?.[...]`) is used in renders to avoid crashes while data hydrates from local storage.

## Where are the default questions defined?
In the `apiQuestion` constant at the top of `src/app/machine-coding/vottingque/page.jsx`, each with `id`, `question`, and initial `rating: 0`.

## Does the component share state across sessions or tabs?
State is persisted per browser via `localStorage`. Changes in one tab are not automatically synced to another tab unless it reloads.

## How is the component exported?
It is exported as the default export of `page.jsx`, making it the page component for the `/machine-coding/vottingque` route in Next.js.

## Why isn’t `questions` initialized with `apiQuestion` directly?
Delaying initialization until after reading `localStorage` ensures that any previously saved ratings replace the defaults, preserving user input across refreshes.

## Interview-style concept questions and answers

### What are the pitfalls of reading `localStorage` during server-side rendering in Next.js, and how does `"use client"` affect this component?
`localStorage` is not defined on the server, so accessing it during SSR will throw. Marking the file with `"use client"` ensures the component only renders on the client, so `localStorage` is available. Additionally, optional chaining and an initial `undefined` state prevent render crashes while hydration happens.

### How would you debounce or batch writes to `localStorage` to avoid excessive serialization while a user rapidly clicks ratings?
Wrap the `setQuestions` effect in a `useEffect` that writes via a debounced function (e.g., `setTimeout`/`clearTimeout` or `lodash.debounce`). Alternatively, enqueue changes in a ref and flush them on `visibilitychange` or after idle time with `requestIdleCallback` to reduce synchronous blocking.

### What trade-offs exist between `localStorage`, `sessionStorage`, cookies, and an API-backed store for persisting client state?
- `localStorage`: persistent per-origin, simple, but synchronous and limited (~5–10 MB); no server access.
- `sessionStorage`: same API but per-tab lifespan; good for temporary state.
- Cookies: small, sent on every request (bandwidth cost), can be HTTP-only/secure for server reads; limited size.
- API-backed store: durable and multi-device, but requires network, auth, and server handling; adds latency and backend complexity.

### How would you sync ratings across multiple tabs (e.g., using the `storage` event or a shared worker)?
Listen for the `storage` event and, when `key === "questions"`, parse the new value and update state. For more robust sync, a BroadcastChannel or shared worker can push updates to all tabs without reloads and avoid duplicate writes.

### How can you unit-test hooks that touch `localStorage` in React (mocks, JSDOM, test setup)?
In Jest or Vitest with JSDOM, mock `window.localStorage` or stub its methods. Clear/mutate it per test to assert hydration logic. For hooks, render with `@testing-library/react`, trigger rating clicks, and assert `localStorage.setItem` calls and state changes.

### What accessibility considerations apply to clickable rating pills (focus states, keyboard handlers, ARIA roles)?
Make pills keyboard focusable (`role="radio"` with `tabIndex`), wrap them in a `role="radiogroup"`, handle `Enter`/`Space` to activate, and visibly indicate focus. Provide `aria-checked` and a descriptive label so screen readers announce the selected value.

### How would you migrate the `questions` shape without breaking existing stored data (versioning, migrations, defaults)?
Store a schema/version alongside the data (e.g., `{ version: 2, items: [...] }`). On load, inspect the version and, if older, run a migration function to add new fields or transform structure, then re-save. Keep backward-compatible defaults for missing properties.

### How could you prevent stale reads when `localStorage` data changes elsewhere (effects listening to `storage`, SWR, or context)?
Subscribe to the `storage` event to rehydrate when another tab writes. In a single-page app, centralize state in context or a store and have storage as a persistence layer, so components react to store updates rather than reading localStorage directly.

### What security/privacy concerns come with storing survey responses in `localStorage`?
`localStorage` is readable by any script on the origin, so XSS would expose responses. It persists until cleared, so shared devices may leak data. For sensitive data, prefer server storage with auth, HTTP-only cookies, or encryption plus strict CSP to reduce XSS risk.

### How would you abstract the persistence layer to swap out storage mechanisms without changing UI code?
Create a storage service with `getQuestions`/`setQuestions` methods. The UI depends on that interface, while the implementation can be swapped (localStorage, cookies, IndexedDB, or API calls). Dependency injection or a simple provider/context keeps the UI agnostic to the backing store.
