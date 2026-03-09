# Select Box Page Q&A

## How is the item list defined?
`items` is memoized to a static array of 10 strings (Alpha–Juliet) via `useMemo([])` so the reference stays stable across renders.

## How does selection logic work?
`selected` stores indices. Click behavior branches on modifier keys:
- Plain click: replaces selection with the clicked index.
- Cmd/Ctrl+Click: toggles the clicked index on/off.
- Shift+Click with an anchor: adds the range between the last anchor and the current index without clearing previous picks.

## What is the anchor used for?
`anchor` tracks the last clicked index. When shift is held, it determines the start/end of the range to add.

## How is selection state shown?
Each row renders a read-only checkbox bound to whether its index is in `selected`, plus styling (`bg-cyan-500/15`) to highlight active rows. A footer lists selected labels or “none”.

## Why use `useCallback` for handlers?
`handleItemClick` and `isSelected` are memoized to avoid recreating functions every render, which keeps referential stability if later passed to memoized children.

## Interview-style concept Q&A

### How would you handle very large lists efficiently?
Virtualize the list (e.g., react-window) so only visible rows render, keeping selection logic the same. Avoid storing massive arrays in state; store a `Set` or diff when possible.

### How do you prevent text selection while shift-clicking?
Add `event.preventDefault()` or CSS `user-select: none` on rows to avoid accidental text highlights during range selection.

### How could you support keyboard selection?
Track a focused index, handle ArrowUp/ArrowDown to move focus, Space/Enter to toggle, and Shift+Arrow to extend selection; ensure rows are focusable (`tabIndex`).

### How would you persist selection across sessions?
Store `selected` indices in `localStorage` (or persist item IDs) on change and hydrate on mount. If items can reorder, persist stable IDs instead of indices.

### What pitfalls exist when mixing meta/ctrl detection across platforms?
macOS uses `metaKey`, Windows/Linux often use `ctrlKey`. Supporting both (as done) ensures consistent UX; avoid requiring both simultaneously.
