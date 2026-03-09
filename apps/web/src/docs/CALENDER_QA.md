# Calendar Page Q&A

## How are date and time displayed?
The page uses `date-fns/format` to format `new Date()` into month (`"MM"`), day (`"dd"`), and time (`"hh:mm"`), then renders a string like `07,12 :04:30` in the UI.

## What does `monthsWithDays` do?
`monthsWithDays` is a lookup of days per month (non-leap), currently unused in rendering. It can support future logic such as validating custom date inputs or building a month grid.

## How does the layout look?
It renders a centered hero with the title “Event Calendar” and subtitle, followed by the current date/time on a dark background with cyan/white text styling.

## Is the clock live?
No. The date/time is computed once at render; there is no ticking interval, so it stays static until the user reloads or navigates.

## How are leap years handled?
They are not yet handled; February is fixed at 28 days. Leap-year support would require adjusting `monthsWithDays` or using date-fns helpers.

## Interview-style concept Q&A

### Why avoid reading `Date` during SSR for user-facing clocks?
Server-rendered timestamps reflect server time and may differ from the user’s timezone. For client-accurate clocks, compute on the client (as here) or rehydrate client-side to avoid mismatch.

### How would you make the time live without hurting performance?
Use a `useEffect` interval (e.g., every second) that updates a `Date` state. Clear the interval on unmount. Keep renders cheap (memoized components, minimal work per tick).

### How do you handle timezones in a calendar UI?
Store timestamps in UTC, convert to local time for display with libraries that support zones (e.g., `date-fns-tz`). Avoid `new Date(string)` without timezone context to prevent parsing ambiguities.

### What changes are needed for leap years and varying month lengths?
Use reliable utilities (`eachDayOfInterval`, `getDaysInMonth`) instead of manual maps. For leap years, derive days per month dynamically from a target year rather than hard-coding.

### How would you localize date/time output?
Use locale-aware formatters (Intl.DateTimeFormat or date-fns with locale packs). Avoid concatenated strings; rely on formatter tokens that respect locale order and scripts.
