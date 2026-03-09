# Search Auto-Complete Q&A

## How is the search input handled?
`search` state updates on every keystroke via `handleChange`. An effect watches `search` and triggers a debounced fetch after 500ms of inactivity; empty input clears results.

## What API powers the suggestions?
It calls `https://dummyjson.com/posts/search?q=<query>&limit=5`. Responses are parsed and `data.posts` is stored in `searchResult`.

## How are matches highlighted?
`highlightMatch` splits each title by a case-insensitive regex for the query and wraps matched parts in `<strong>`, leaving non-matches in `<span>`.

## How does the UI render results?
When results exist, it shows a dropdown under the input with each title highlighted. Without results, nothing extra renders; empty input resets the list.

## Is there error handling or loading state?
No explicit loading/error handling is present; failed fetches would be silent, and stale results could display if a request fails. Debounce reduces request volume but not errors.

## Interview-style concept Q&A

### How would you cancel stale requests as the user types?
Use `AbortController` and abort the previous fetch when a new query starts, or use a library with built-in cancellation. Only apply the latest fulfilled response to state to avoid race conditions.

### How to handle API errors gracefully?
Track `status` (`idle|loading|error|success`), show spinners or error messages, and retry buttons. Log or report errors for diagnostics.

### How to prevent XSS in highlighted HTML?
Avoid `dangerouslySetInnerHTML`; instead, build React nodes (as here) so React escapes content. If server returns HTML, sanitize before rendering.

### How would you paginate or limit results for long lists?
Add `limit`/`skip` params and navigation, or fetch top-N and show “View all” linking to a full search page. Virtualize if showing many items.

### How to make this accessible?
Implement the ARIA combobox pattern: input with `role="combobox"` linked to a listbox, keyboard navigation through options, `aria-expanded`, `aria-activedescendant`, and announcements for results count/loading/errors.
