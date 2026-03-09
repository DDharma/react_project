# Voting Page Q&A

## How is voting state managed?
State lives in a reducer (`useReducer(reducer, INITIAL_STATE)`) imported from `src/utils/reducers/vottingReduce.jsx`. Each framework key holds `voteCount` and `time`.

## What does the `vote` handler dispatch?
`vote(name)` dispatches `{ name, vote: true, time: new Date().toLocaleString(), type: "INCREMENT" }`, which the reducer uses to increment the named framework’s count and record the timestamp.

## How are vote counts displayed?
`stateArr` enumerates keys, and each card reads `state?.[key]?.voteCount` with a default of `0`. “Last vote” shows the stored `time` or “No votes yet”.

## Is the reducer pure?
Yes; it returns a new state object with an updated slice for the target framework. Unknown action types return a shallow copy of state.

## How is the UI structured?
Cards are rendered in a responsive grid with a vote button, count, and last vote time. The UI styles use a dark gradient and focus/hover states for the button.

## Interview-style concept Q&A

### Why use `useReducer` instead of multiple `useState` hooks here?
`useReducer` centralizes related updates (count + timestamp) and keeps the state shape in one place, which scales better if more actions (reset, decrement) are added, compared to multiple setters scattered in handlers.

### How to persist votes across reloads or share across users?
- Local persistence: hydrate from `localStorage` on mount and write back on state changes.
- Shared across users: back the reducer with an API; fetch initial tallies, dispatch a hydrate action, and post increments. Consider optimistic updates and reconciliation for failures.

### How to prevent double-click spam or rapid voting?
Add a cooldown per framework (store `lastVoteMs` and ignore if too recent), disable the button briefly after click, or throttle the handler. Server-side rate limiting is needed for real integrity.

### How would you write tests for the reducer?
Unit tests should call `reducer(prev, action)` and assert the returned object: count increments by 1, time equals the payload, and unknown types return the same values. Snapshot tests can ensure shape stability.

### How could you support undoing a vote?
Track vote history (stack of actions) or store counts as integers allowing decrement. Add a `DECREMENT` action and a guard to prevent negative counts; optionally store per-user vote state to avoid multi-undo exploits.
