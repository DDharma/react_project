## React Voting/Timer Q&A (with diagrams)

### How does `useReducer` differ from `useState`, and when choose each?
```
Intent:   useState → simple, local fields       useReducer → related fields + actions
Updates:  setX(...) scattered in handlers      dispatch({type, payload}) into one reducer
Sharing:  pass setter props                    pass dispatch or use Context
Perf:     minimal overhead                     avoids recreating many handlers; same runtime cost
Best for: toggles, inputs, small pieces        state machines, multi-field updates, undo/redo
```
Pick `useReducer` when multiple values change together or you want action semantics; pick `useState` for tiny, isolated state.

### Why is immutability important in reducers?
```
Before:
 state -> { react: { voteCount: 1 } }
 mutate: state.react.voteCount = 2   (same reference)
 React sees same object reference → may skip rerender → stale UI.

After (immutable):
 state -> { react: {...} }
 return { ...state, react: { ...state.react, voteCount: 2 } }
 new reference signals React → rerender with updated data.
```

### How do functional updates avoid stale state?
- `setX(prev => prev + 1)` reads the latest committed value, not the value captured when the handler was created.
- Reducers receive `state` as an argument each dispatch, so they operate on the freshest snapshot and avoid closure staleness in event handlers or timers.

### Effect lifecycle with `[running]` and a timer
```
[running] changes → run effect
  if running === true:
    create interval (tick every 1000ms)
    return cleanup: clearInterval(timer)
  if running === false:
    effect bails; no interval created

Cleanup runs when:
- running flips (true→false or false→true), or
- component unmounts.

Note: cleanup does NOT run every tick; it only runs on dependency change/unmount.
```

### Event loop vs rendering
```
1) JS call stack empty → event loop pulls macro task (interval callback).
2) Interval callback runs → dispatches state update.
3) React batches update → schedules render.
4) Render/commit occurs; browser paints.
5) Next interval tick enqueues again after >=1000ms, but may drift under load.
```

### Prevent rapid double-votes
- Handler guard: throttle/debounce click handler.
- Reducer guard: ignore if `now - lastVote < cooldown`.
- UI feedback: disable button briefly while cooldown runs.

### Persist vote counts/timestamps across reloads
- Local: hydrate from `localStorage` on mount; effect writes back on `state` changes.
- Remote: fetch initial state from an API; dispatch hydrate action; post updates on change.
- Keep persistence concerns outside the reducer; reducer stays pure.

### Share voting state across components
- Lift reducer to a parent and pass `state`/`dispatch` down.
- Wrap in Context: `const VoteContext = createContext();` → provider uses `useReducer`; children call `useContext(VoteContext)` to read/dispatch.
- For large apps, consider a dedicated state library if cross-cutting concerns grow.

### Why do `key`s matter, and why avoid index keys?
- Keys let React match elements between renders. Stable keys prevent DOM reuse bugs.
- Index keys can mismatch when items insert/delete/reorder, causing incorrect data to stick to the wrong row. Use stable ids (here, the framework name).

### Testing the reducer and components
- Reducer tests: call reducer with state/action, assert returned state (increments, timestamp set, unknown types return same state).
- Component tests: render, click 👍, assert count increments and last-vote text updates; verify accessibility roles/labels.
- Optionally mock `Date` to make timestamp assertions deterministic.

### Raw timestamp vs formatted string in state
- Store raw (e.g., `Date.now()`) → render-time formatting allows i18n/timezone flexibility and consistent comparisons.
- Storing formatted strings locks in locale/format and makes further date math harder. Prefer raw in state, format in the view.

### Performance for many cards
- Use `React.memo` on card components; ensure props are stable (derive handlers with `useCallback` if passing them down).
- Memoize derived lists (`useMemo`) if computation is heavy.
- Virtualize very long lists to render only what’s visible.
- Avoid unnecessary re-renders by keeping unrelated state out of the list’s parent when possible.
