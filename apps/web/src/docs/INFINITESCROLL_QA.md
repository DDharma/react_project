# Infinite Scroll Page Q&A

## How does pagination work?
`pageNumber` starts at 1; each fetch calls `https://dummyjson.com/posts?limit=20&skip=pageNumber*limit`, appending new posts to `paginatedResult`. `hasMore` is true when the response size equals the limit.

## What triggers loading more data?
An `IntersectionObserver` watches a sentinel `div` at the bottom. When it enters the viewport and `hasMore`/`!loading` are true, `pageNumber` increments, which triggers a fetch in the effect.

## How is loading state shown?
`loading` toggles before/after fetch. While true, “Loading…” appears; when `hasMore` is false and not loading, it shows “No more posts to load.”

## How are posts rendered?
`cards` is memoized; it maps `paginatedResult` to styled articles with title, tags, body, and reaction counts (`likes`, `dislikes`, `views`) with safe fallbacks.

## What are potential data issues?
`skip` calculation (`pageNumber * limit`) skips the first page worth of items because `pageNumber` starts at 1; starting at 0 would include the first 20. Errors are not handled, so failed requests silently leave the list unchanged.

## Interview-style concept Q&A

### How to avoid duplicate fetches near list bottom?
Debounce the observer callback or guard with `loading` (as done). Also ensure the sentinel isn’t observed multiple times or re-rendered unnecessarily.

### How would you handle API errors or retries?
Track an `error` state, show a retry button that re-fetches the same page, and log failures. Optionally back off on repeated errors to avoid hammering the API.

### How do you prevent missing the first page?
Initialize `pageNumber` at 0 and compute `skip = pageNumber * limit`, or leave `pageNumber` at 1 but set `skip = (pageNumber - 1) * limit`. Confirm API pagination semantics.

### What’s a good pattern for SSR + infinite scroll?
SSR the first page for faster paint and SEO, then hydrate and continue fetching subsequent pages client-side. Keep hydration data inlined to avoid double fetching.

### How could you support pull-to-refresh or manual load more?
Add a “Load more” button as a fallback for browsers without IntersectionObserver or for accessibility. For pull-to-refresh, listen for scroll offset at top and trigger a refresh fetch with `pageNumber` reset.
