# Live Comment Page Q&A

## How does the live timer work?
An effect starts a `setInterval` on mount that increments `seconds` every 1000ms. Cleanup clears the interval on unmount so the timer stops when the component is removed.

## How are comments displayed in send order?
Comments store the `at` timestamp (seconds since load). A memoized `sortedComments` copies and sorts by `at` ascending before rendering, ensuring the stream shows messages in the order sent.

## What validations exist for adding/editing comments?
`handleSubmit` trims input, requires non-empty text, and caps length at 140 characters. It sets an error message if validation fails and blocks submission.

## How does add vs. edit work?
- Add: creates a comment `{ id, text, at: seconds, edited: false }` and appends it.
- Edit: when `editingId` matches a comment, submit updates its `text` and marks `edited: true`. Cancel resets the form state without changes.

## How are deletes handled?
`handleDelete` filters out the comment by id. If the deleted comment was being edited, the form resets to avoid stale editing state.

## What drives the video placeholder?
The page uses an inline SVG data URL (`placeholderImg`) instead of a YouTube embed. It displays a “Live” badge and timer overlay for a simple hero area without external dependencies.

## Why use `useMemo` and `useCallback` here?
`useMemo` ensures sorting happens only when comments change; `useCallback` memoizes handlers (`handleSubmit`, `handleEdit`, `handleDelete`) to avoid unnecessary re-renders if passed down or used in dependency arrays.

## How are timestamps formatted?
`formatTime` converts seconds into `mm:ss` with leading zeros. It’s used for the live timer and each comment’s “sent at” label.

## Interview-style concept Q&A

### How would you persist the chat across refreshes?
Hydrate from `localStorage` (or IndexedDB) on mount, and write back whenever comments change. Include a schema/version to migrate safely. For multi-user sync, connect to an API or WebSocket to store and broadcast messages.

### How could you simulate real-time arrival without websockets?
Use `setInterval` to poll an API for new messages; merge by id or timestamp to avoid duplicates. Alternatively, preload a scriptable queue of messages and drip them into state over time.

### How would you handle very active streams efficiently?
Virtualize the comment list to render only visible rows, batch state updates (e.g., append in chunks), and debounce expensive work like sorting if timestamps already arrive ordered. Use stable keys and avoid inline functions in large lists.

### What accessibility steps apply to a live chat?
Ensure the textarea is labeled, buttons are reachable via keyboard, and live updates are announced (ARIA `aria-live="polite"` region for new messages). Maintain sufficient color contrast and visible focus outlines.

### How do you prevent XSS or unsafe content in chat?
Never render HTML from user input; keep content as plain text (as done). If supporting markdown or links, sanitize with a trusted library. Consider profanity filtering on input or server-side validation.
