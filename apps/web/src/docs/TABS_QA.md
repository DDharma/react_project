# Tabs Page Q&A

## How is tab state managed?
`activeTab` holds the current tab key (defaults to `"profile"`). Clicking a tab would call `setActiveTab(key)` to switch views; only the active tab’s content renders.

## What data shape backs the tabs?
`data` is an object with `profile` (name/email/age) and `settings` (theme). Each tab reads/writes its slice via `setData` while preserving the rest of the object.

## How do the profile inputs stay controlled?
Each input’s `value` comes from `data.profile.<field>`, and `onChange` clones `data` while updating only the specific field, keeping React in control of the input value.

## Why isn’t `useState` imported?
The current file imports `use` instead of `useState`; to function correctly, it should import `useState` from React. The concept remains: two pieces of state (`data`, `activeTab`) drive the UI.

## How would additional tabs be added?
Define a new tab key, render a button to set it active, and create a tab component that edits `data.<newSlice>`. Keep updates immutable to avoid losing other slices.

## Interview-style concept Q&A

### When would you choose tabs over separate routes?
Tabs suit closely related content that benefits from quick, in-place switching without full navigation. Routes are better for deep links, history navigation, and SEO-discoverable pages.

### How do you keep tab content unmounted vs. mounted?
- Unmounted (as here): conditional render removes inactive tabs, freeing resources but losing internal state.
- Mounted: render all tabs but hide inactive ones with CSS/`hidden` props to preserve state (form inputs, focus) at higher memory cost.

### How to prevent state loss when switching tabs with forms?
Lift state up (as done with `data`) or keep tabs mounted. Alternatively, persist form slices to a store/context so unmounting doesn’t drop values.

### What accessibility roles should tabs use?
Use `role="tablist"` for the container, `role="tab"` for triggers, `aria-selected`, `aria-controls`, and `id`/`aria-labelledby` to link tabs to `role="tabpanel"` content. Manage keyboard navigation with Arrow keys, Home/End, and focus styles.

### When might `useReducer` beat multiple `useState` calls in tabs?
If many fields change together (e.g., complex settings), a reducer can centralize updates, validation, and undo/redo, reducing scattered setter logic across tab components.
