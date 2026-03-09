## Infinite Scroll Component – Concepts & Q&A

Code reference: `src/app/machine-coding/infinetescroll/page.jsx`

### Core flow
- State: `paginatedResult` (accumulated posts), `pageNumber`, `loading`, `hasMore`.
- Fetch: GET `https://dummyjson.com/posts?limit=${limit}&skip=${pageNumber * limit}`; append results; set `hasMore` when a full page arrives.
- Trigger: `useEffect` on `pageNumber` starts fetch; `IntersectionObserver` on a sentinel div bumps `pageNumber` when visible.
- UI: Renders cards via `useMemo`, shows loading indicator and “no more” message, sentinel at the bottom.

### Key React concepts
- `useState`: tracks list, paging, loading, and completion flags.
- `useEffect`: 
  - Fetch effect depends on `pageNumber`; runs each time the page increments.
  - Observer effect depends on `hasMore`/`loading`; sets up and cleans up an `IntersectionObserver`.
- `useMemo`: memoizes rendered cards to avoid re-mapping when unrelated state changes.
- `useRef`: holds the sentinel DOM node; survives renders without causing rerenders.

### IntersectionObserver details
- Sentinel: a tiny div at the bottom (`ref={scrollRef}`) is observed.
- Root: `root: null` uses viewport; `rootMargin: "200px 0px"` prefetches before reaching the bottom.
- Callback fires when sentinel intersects; if `hasMore` and not `loading`, increment `pageNumber`.
- Cleanup: disconnects observer on effect cleanup to avoid leaks.

### Pagination logic
- `skip = pageNumber * limit` to fetch the next slice.
- Append with `setPaginatedResult([...paginatedResult, ...data.posts])` (could be improved with functional form).
- `hasMore` is true if a full page is returned; false when fewer than `limit` items arrive.

### Avoiding race/duplication
- Loading guard: prevents multiple increments while a fetch is in flight.
- `hasMore` guard: stops observing when no more data.
- (Optional improvement) AbortController to cancel in-flight fetch when `pageNumber` changes.

### Performance considerations
- Memoized cards prevent unnecessary remapping on unrelated state changes.
- `rootMargin` preloads before the user hits the bottom to reduce perceived latency.
- Minimal DOM in the sentinel; observer disconnects on cleanup.

### Follow-up interview questions
- How would you handle errors and retries? Where would you surface error state in the UI?
- How would you prevent stale appends if a slower request resolves after a faster one? (AbortController or request tokens)
- What if the API returns total count—how could you compute `hasMore` more accurately?
- How would you support server-side rendering or initial data hydration with infinite scroll?
- How would you add “Load more” as a fallback when IntersectionObserver is unsupported?
- What accessibility considerations apply for infinite lists (focus management, announcements)?
- How could you virtualize the list for very large data sets? What trade-offs arise?
- How would you throttle or debounce intersection callbacks to avoid rapid fire under fast scrolling?
- How would you persist scroll position and loaded items across navigation?
- If multiple infinite lists exist on a page, how would you isolate their observers and state?

### Answers to follow-up questions
- Handle errors and retries by keeping `status`/`error` state, rendering an inline error with a “Retry” button that re-dispatches the same page fetch, and optionally applying exponential backoff to avoid hammering the API.
- Prevent stale appends with `AbortController` (abort previous fetch before starting a new one) or by tagging each request with the expected page and discarding responses whose tag no longer matches `pageNumber`.
- If the API returns `total`, compute `hasMore` via `(pageNumber + 1) * limit < total` so you stop precisely when all items are loaded instead of inferring from page size.
- For SSR/hydration, fetch the first page on the server and embed it in the page props; initialize state from that payload and skip the first client fetch to avoid duplication, then continue client-only pagination.
- Provide a “Load more” button that calls the same fetch logic; keep it visible for browsers without IntersectionObserver (feature-detect and conditionally attach the observer).
- Accessibility: wrap the list in `role="feed"` or use semantic list markup; announce new items with `aria-live="polite"`, preserve focus, and avoid unexpected focus jumps when content grows.
- Virtualize using libraries like `react-window` to render only visible rows; trade-offs include more complex measurement, potential issues with dynamic heights, and trickier scroll-to-index logic.
- Throttle/debounce the observer callback or set a higher `rootMargin` so fetches happen predictably; ensure you guard with `loading` to avoid rapid double increments.
- Persist scroll and items by storing `pageNumber` and `paginatedResult` in a store or `sessionStorage`, then restore and call `scrollTo` on mount so navigation back to the page resumes where the user left off.
- When multiple infinite lists exist, give each its own `IntersectionObserver` (or shared instance keyed per sentinel) and isolate state/hooks per list to avoid cross-triggering; keep unique sentinels and limits per list.
