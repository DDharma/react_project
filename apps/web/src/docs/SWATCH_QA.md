# Stopwatch Page Q&A

## How does the stopwatch track time?
`elapsedSeconds` increments every second via an interval started when `running` becomes true. The effect cleans up the interval on dependency change or unmount.

## How is time formatted for display?
`formatTime` converts total seconds into `hh:mm:ss` with leading zeros, returning both parts and a `label` string used by the digital display and saved laps.

## What controls are supported?
`controls` defines `start`, `stop`, `reset`, and `save`. `clockControls` switches on the action: start/stop toggle `running`, reset clears time and laps, save captures the current formatted label into `savedTimes`.

## How are analog clock hands driven?
Angles derive from `elapsedSeconds`: seconds hand rotates 6° per second; minutes hand advances with both minutes and fractional seconds; hours hand moves with minutes to mirror a real clock.

## How are laps stored and shown?
`savedTimes` holds an array of formatted labels. When non-empty, laps render in a grid with “Lap #” and the timestamp; otherwise a placeholder message invites saving.

## Interview-style concept Q&A

### Why clear intervals in React effects?
Without cleanup, intervals continue running after unmount or after toggling `running`, causing memory leaks and unexpected state updates. Returning a cleanup from the effect ensures timers are cleared.

### How to avoid drift in long-running timers?
Use a monotonic source like `Date.now()` (or `performance.now()`) to compute elapsed time each tick instead of incrementing by 1; adjust for missed frames by computing differences since last tick.

### How would you persist laps across reloads?
Sync `savedTimes` and `elapsedSeconds` to `localStorage` (or IndexedDB) in an effect, and hydrate on mount with guards for missing/invalid data. For multi-device persistence, post to an API.

### How to make the stopwatch accessible?
Label controls with `aria-label`, ensure buttons are focusable, provide status text for screen readers (e.g., “Running” vs “Paused”), and avoid conveying state via color alone.

### How could you prevent rapid duplicate saves?
Disable the save button while `running` is false or if the last saved lap equals the current label; or throttle saves to a minimum interval to reduce spam.
