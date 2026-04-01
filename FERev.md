# Frontend Interview Mastery Guide — Senior Engineer (6 YOE)

> **Prepared for:** Dharma — Senior Frontend Engineer  
> **Target Level:** Senior FE / Frontend Lead (6 years experience)  
> **Stack:** React 19 · Next.js 15 · TypeScript · AI Integration  

---

# TABLE OF CONTENTS

1. [React Core](#1-react-core)
2. [Next.js 15](#2-nextjs-15)
3. [TypeScript Advanced](#3-typescript-advanced)
4. [State Management](#4-state-management)
5. [Performance](#5-performance)
6. [Testing](#6-testing)
7. [CSS & Styling](#7-css--styling)
8. [Accessibility](#8-accessibility)
9. [Architecture](#9-architecture)
10. [System Design](#10-system-design)
11. [Machine Coding](#11-machine-coding)
12. [Scenario-Based Questions](#12-scenario-based-questions)
13. [JavaScript Input-Output](#13-javascript-input-output)
14. [Promises Deep Dive](#14-promises-deep-dive)

---

# 1. REACT CORE

## 1.1 Component Lifecycle & Hooks — `HIGH PRIORITY`

### The Hooks You MUST Know Cold

#### `useState` — State Primitive

```jsx
const [count, setCount] = useState(0);

// Functional update (when new state depends on previous)
setCount(prev => prev + 1); // ✅ Safe in async contexts
setCount(count + 1);         // ❌ Can be stale in closures
```

**Interview trap:** `setState` is asynchronous in React. Multiple calls in the same event handler are batched (React 18+). Use functional updates when the new state depends on the old state.

#### `useEffect` — Synchronizing with External Systems

```jsx
useEffect(() => {
  // SETUP: runs after paint
  const sub = api.subscribe(handler);
  
  // CLEANUP: runs before next effect AND on unmount
  return () => sub.unsubscribe();
}, [dependency]); // Only re-runs when dependency changes
```

**Cleanup function deep dive:**
- Cleanup runs **before** the next effect execution (not just on unmount)
- React calls cleanup with the **old** props/state values
- This prevents memory leaks (subscriptions, timers, AbortControllers)

```jsx
// REAL-WORLD: Cancelling stale API calls
useEffect(() => {
  const controller = new AbortController();
  
  fetch(`/api/user/${userId}`, { signal: controller.signal })
    .then(res => res.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });
  
  return () => controller.abort(); // Cancel if userId changes before fetch completes
}, [userId]);
```

#### `useRef` — Mutable Container That Doesn't Trigger Re-renders

```jsx
const renderCount = useRef(0);
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  renderCount.current += 1; // Mutating ref does NOT trigger re-render
});

// DOM access
inputRef.current?.focus();
```

**Two use cases:**
1. **DOM references** — accessing/measuring DOM nodes
2. **Instance variables** — storing values that survive re-renders without causing them (previous values, timer IDs, abort controllers)

#### `useLayoutEffect` vs `useEffect` — The Critical Difference

| Aspect | `useEffect` | `useLayoutEffect` |
|--------|-------------|-------------------|
| **Timing** | After browser paint | Before browser paint |
| **Blocking** | Non-blocking (async) | Blocks visual updates |
| **Use when** | Data fetching, subscriptions, logging | DOM measurements, preventing visual flicker |
| **Performance** | Better (doesn't block paint) | Can cause jank if slow |

```jsx
// WHEN TO USE useLayoutEffect:
// You need to measure DOM and update state BEFORE user sees anything
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setTooltipPosition(height); // Updates before paint — no flicker
}, []);
```

**Rule of thumb:** Start with `useEffect`. Switch to `useLayoutEffect` ONLY when you see a visual flicker because the DOM measurement + state update needs to happen synchronously before paint.

---

### ⭐ `useCallback` vs `useMemo` — THE Most Asked Comparison

This is asked in almost every senior React interview. Know this perfectly.

#### `useMemo` — Memoizes a **computed VALUE**

```jsx
// WITHOUT useMemo: expensiveFilter runs on EVERY render
const filteredList = items.filter(item => item.price > threshold);

// WITH useMemo: only recalculates when items or threshold change
const filteredList = useMemo(
  () => items.filter(item => item.price > threshold),
  [items, threshold]
);
```

#### `useCallback` — Memoizes a **FUNCTION REFERENCE**

```jsx
// WITHOUT useCallback: new function reference every render
// This means ChildComponent re-renders even if nothing changed
const handleClick = (id) => deleteItem(id);

// WITH useCallback: same function reference between renders
const handleClick = useCallback(
  (id) => deleteItem(id),
  [deleteItem]
);
```

#### The Comparison Table

| Feature | `useMemo` | `useCallback` |
|---------|-----------|---------------|
| **Returns** | The **result** of the function | The **function itself** |
| **Memoizes** | Expensive computation results | Function references |
| **Equivalent** | `useMemo(() => fn, deps)` returns value | `useCallback(fn, deps)` = `useMemo(() => fn, deps)` |
| **Use when** | Heavy computations (filtering 10K items, complex math) | Passing callbacks to memoized children |
| **Don't use when** | Cheap computations (< 1ms) | Function isn't passed as prop to `React.memo` child |

#### When `useCallback` Actually Matters

```jsx
// ChildComponent is wrapped in React.memo
const MemoChild = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ WITHOUT useCallback: MemoChild re-renders on every Parent render
  // because onClick is a new reference each time
  const handleClick = () => console.log('clicked');
  
  // ✅ WITH useCallback: MemoChild skips re-render because
  // handleClick is the same reference
  const handleClick = useCallback(() => console.log('clicked'), []);
  
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <MemoChild onClick={handleClick} />
    </>
  );
}
```

**Key insight for interviews:** `useCallback` is ONLY useful when combined with `React.memo` on the child, or when the callback is a dependency of another hook. Without `React.memo`, the child re-renders anyway because the parent re-renders.

---

### The Stale Closure Problem

This is a **senior-level trap** that comes up in every deep React interview.

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // ❌ Always logs 0! Stale closure.
      setCount(count + 1); // ❌ Always sets to 1!
    }, 1000);
    return () => clearInterval(id);
  }, []); // Empty deps = captures count = 0 forever

  // FIX 1: Functional update (most common fix)
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1); // ✅ Always has latest value
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // FIX 2: useRef to hold mutable current value
  const countRef = useRef(count);
  countRef.current = count; // Update ref on every render
  
  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current); // ✅ Always current
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
```

**Why this happens:** The callback inside `useEffect` closes over the `count` variable from the render when the effect was created. Since deps is `[]`, the effect never re-runs, so the callback forever sees `count = 0`.

---

### Rules of Hooks (Why Order Matters)

1. **Only call hooks at the top level** — never inside conditions, loops, or nested functions
2. **Only call hooks from React functions** — components or custom hooks

```jsx
// ❌ WRONG: conditional hook call
function Bad({ isAdmin }) {
  if (isAdmin) {
    const [data, setData] = useState(null); // React can't track this!
  }
}

// ✅ RIGHT: always call, conditionally use
function Good({ isAdmin }) {
  const [data, setData] = useState(null);
  // Use data only when isAdmin is true
}
```

**Why order matters internally:** React stores hooks in an array indexed by call order. If a hook is skipped conditionally, all subsequent hooks shift positions, causing React to return wrong values for every hook after the skipped one.

---

### Custom Hook Extraction Patterns

```jsx
// Extract reusable logic into custom hooks
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

**When to extract a custom hook:**
- Logic is shared between 2+ components
- The hook contains stateful logic with `useState` + `useEffect`
- It simplifies a component by separating concerns
- Testing: custom hooks are easier to test with `renderHook()`

---

## 1.2 React 19 New Features — `HIGH PRIORITY`

React 19 introduces server-first patterns. Knowing these signals you're current.

### `useActionState` — Form State Management

Replaces the need for manual loading/error/success state in forms.

```jsx
import { useActionState } from 'react';

async function submitForm(prevState, formData) {
  const name = formData.get('name');
  try {
    await api.createUser(name);
    return { status: 'success', message: 'User created!' };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

function MyForm() {
  const [state, formAction, isPending] = useActionState(submitForm, {
    status: 'idle',
    message: '',
  });

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state.status === 'error' && <p className="error">{state.message}</p>}
      {state.status === 'success' && <p className="success">{state.message}</p>}
    </form>
  );
}
```

**Why it matters:** Eliminates 50%+ of form boilerplate (separate `loading`, `error`, `success` states). Works with progressive enhancement — form submits even without JS.

### `useOptimistic` — Instant UI Feedback

```jsx
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTodo) => [...currentTodos, { ...newTodo, pending: true }]
  );

  async function handleAdd(formData) {
    const title = formData.get('title');
    addOptimisticTodo({ title, id: crypto.randomUUID() }); // Instant UI update
    await addTodo(title); // Actual API call — on failure, optimistic state auto-reverts
  }

  return (
    <form action={handleAdd}>
      {optimisticTodos.map(todo => (
        <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
          {todo.title}
        </li>
      ))}
    </form>
  );
}
```

### `use()` API — Read Promises and Context in Render

#### Theory: What Problem Does `use()` Solve?

Before React 19, fetching data in components was messy. You had two choices, and both had serious problems:

**The Old Way #1 — useEffect (Client-Side Fetching):**
```jsx
// ❌ THE WATERFALL PROBLEM
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(data => setUser(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg error={error} />;
  return <h1>{user.name}</h1>;
}

// Problems:
// 1. Component renders EMPTY first (loading = true), then re-renders with data
// 2. Every component manages its own loading/error state (boilerplate)
// 3. WATERFALL: Parent fetches → renders children → children fetch → renders THEIR children
//    Each level waits for the previous. 4 levels deep = 4 sequential round trips.
// 4. SEO: Search engines see empty content on first render
// 5. CLS: Content shifts when data arrives and UI fills in
```

**The Old Way #2 — Suspense with Libraries (React 18):**
Suspense existed but only worked with specific libraries (Relay, Next.js) that implemented the "suspense protocol" internally. Regular `fetch()` didn't work with Suspense. There was no official React API for it.

**The React 19 Solution — `use()` API:**

`use()` is a new React API that can read the value of a **Promise** or **Context** directly during render. When it reads an unresolved Promise, it **suspends** the component (triggers the nearest `<Suspense>` fallback) until the Promise resolves.

```jsx
import { use, Suspense } from 'react';

function UserProfile({ userPromise }) {
  // use() SUSPENDS until the promise resolves
  // No useState, no useEffect, no loading/error state management
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
```

#### How `use()` Works Internally — Step by Step

```
1. Parent creates a Promise: const userPromise = fetchUser(id)
2. Parent passes promise as prop: <UserProfile userPromise={userPromise} />
3. UserProfile calls use(userPromise)
4. IF promise is PENDING:
   → React THROWS the promise (literally throws it like an error)
   → The nearest <Suspense> catches it
   → Suspense renders its fallback={<Spinner />}
   → React subscribes to the promise
5. IF promise is RESOLVED:
   → use() returns the resolved value
   → Component renders normally with data
6. IF promise is REJECTED:
   → The nearest Error Boundary catches it
   → Error fallback UI is rendered
```

#### `use()` for Promises — Complete Example

```jsx
import { use, Suspense } from 'react';

// IMPORTANT: Create the promise OUTSIDE the component
// If you create it inside, every re-render creates a NEW promise → infinite loop
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// Parent creates the promise and passes it down
function UserPage({ userId }) {
  // Promise is created ONCE here during render
  // React caches it — same promise on re-render
  const userPromise = fetchUser(userId);
  const postsPromise = fetchPosts(userId);

  return (
    <div>
      <h1>User Profile</h1>
      {/* Each Suspense boundary loads independently */}
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userPromise={userPromise} />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}

function UserProfile({ userPromise }) {
  const user = use(userPromise); // Suspends until resolved
  return (
    <div className="profile-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}

function UserPosts({ postsPromise }) {
  const posts = use(postsPromise); // Suspends independently
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**What happens at runtime:**
1. `UserPage` renders — creates both promises (both start fetching SIMULTANEOUSLY)
2. `UserProfile` calls `use(userPromise)` — promise pending → shows `<ProfileSkeleton />`
3. `UserPosts` calls `use(postsPromise)` — promise pending → shows `<PostsSkeleton />`
4. User data arrives first → `<ProfileSkeleton />` replaced with real profile
5. Posts data arrives later → `<PostsSkeleton />` replaced with real posts

**No waterfall!** Both fetches start at the same time because promises are created in the parent.

#### `use()` for Context — The Conditional Context Superpower

Before React 19, `useContext` could NOT be called conditionally (Rules of Hooks). `use()` CAN be called conditionally because **`use()` is not a hook** — it's a regular API.

```jsx
import { use, createContext } from 'react';

const ThemeContext = createContext('light');
const AdminContext = createContext(null);

function Dashboard({ isAdmin }) {
  // ✅ use() CAN be called conditionally — NOT a hook
  const theme = use(ThemeContext);
  
  // This would be IMPOSSIBLE with useContext
  if (isAdmin) {
    const adminData = use(AdminContext); // Conditional context read!
    return <AdminDashboard theme={theme} admin={adminData} />;
  }
  
  return <UserDashboard theme={theme} />;
}

// ❌ With useContext — this VIOLATES Rules of Hooks
function BrokenDashboard({ isAdmin }) {
  const theme = useContext(ThemeContext);
  if (isAdmin) {
    const adminData = useContext(AdminContext); // ❌ ILLEGAL — conditional hook call
  }
}
```

#### `use()` — Where It CAN and CANNOT Be Called

```
✅ CAN be called:
   - Inside if/else blocks
   - Inside loops (for, while)
   - Inside try/catch blocks
   - After early returns

❌ CANNOT be called:
   - Inside try/catch blocks when reading PROMISES
     (because suspense uses throw internally — try/catch interferes)
   - Outside React components/hooks
```

```jsx
function Component({ condition, dataPromise }) {
  // ✅ OK: Conditional use() for context
  if (condition) {
    const theme = use(ThemeContext);
  }

  // ❌ BAD: Don't wrap use() with promises in try/catch
  // try {
  //   const data = use(dataPromise); // Breaks suspense mechanism
  // } catch (e) { }

  // ✅ OK: Error Boundary handles promise rejections instead
  const data = use(dataPromise);
}
```

#### Real-World Use Case: API Dashboard with Parallel Loading

```jsx
// In a Next.js Server Component (or any component that can create promises)
function AnalyticsDashboard({ clientId, dateRange }) {
  // All 4 fetches start SIMULTANEOUSLY — no waterfall
  const revenuePromise = fetchRevenue(clientId, dateRange);
  const usersPromise = fetchActiveUsers(clientId, dateRange);
  const apiCallsPromise = fetchAPICallMetrics(clientId, dateRange);
  const errorsPromise = fetchErrorRates(clientId, dateRange);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ErrorBoundary fallback={<WidgetError name="Revenue" />}>
        <Suspense fallback={<MetricSkeleton />}>
          <RevenueWidget dataPromise={revenuePromise} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="Users" />}>
        <Suspense fallback={<MetricSkeleton />}>
          <UsersWidget dataPromise={usersPromise} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="API Calls" />}>
        <Suspense fallback={<ChartSkeleton />}>
          <APICallsChart dataPromise={apiCallsPromise} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="Errors" />}>
        <Suspense fallback={<ChartSkeleton />}>
          <ErrorRateChart dataPromise={errorsPromise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Each widget is dead simple — no loading/error boilerplate
function RevenueWidget({ dataPromise }) {
  const data = use(dataPromise);
  return (
    <div className="metric-card">
      <h3>Revenue</h3>
      <p className="text-3xl font-bold">${data.total.toLocaleString()}</p>
      <span className={data.trend > 0 ? 'text-green-500' : 'text-red-500'}>
        {data.trend > 0 ? '↑' : '↓'} {Math.abs(data.trend)}%
      </span>
    </div>
  );
}
```

**Why this is better than useEffect:**
1. **No waterfall** — all 4 fetches start simultaneously in the parent
2. **No boilerplate** — zero useState/useEffect/loading/error management per widget
3. **Independent loading** — each widget shows its own skeleton and fills in independently
4. **Error isolation** — if Error Rate API fails, Revenue widget still works
5. **SEO-friendly** — with Server Components, data fetches happen on the server

#### `use()` vs `useEffect` vs TanStack Query — When to Use What

| Scenario | Best Choice | Why |
|----------|-------------|-----|
| Server Component data fetching | `use()` + async component | Data fetched on server, zero client JS |
| Client Component one-time fetch | `use()` + Suspense | Cleaner than useEffect, no loading state |
| Client data with caching, refetching, pagination | TanStack Query | Mature caching, stale-while-revalidate, devtools |
| Polling / real-time data | TanStack Query (`refetchInterval`) | Built-in polling, background refetch |
| Simple local state toggle | Neither — `useState` | No async involved |

**Interview answer:** "`use()` is great for simple, one-shot data fetching, especially in Server Components. For anything needing caching, background refetch, optimistic updates, or pagination, I still use TanStack Query. They complement each other."

---

### `ref` as Prop — No More `forwardRef` (React 19)

#### Theory: Why Did `forwardRef` Exist?

In React, `ref` was historically a **special prop** — React intercepted it before passing props to the component. This meant functional components couldn't receive `ref` through normal props:

```jsx
// BEFORE React 19 — ref is NOT in props
function MyInput(props) {
  console.log(props.ref); // undefined! React stripped it out
  return <input />;
}

// To receive ref, you HAD to use forwardRef wrapper
const MyInput = forwardRef(function MyInput(props, ref) {
  // ref is the second argument, separate from props
  return <input ref={ref} {...props} />;
});
```

**Problems with `forwardRef`:**
1. **Boilerplate** — extra wrapper for something that should be simple
2. **TypeScript pain** — typing `forwardRef` was verbose: `forwardRef<HTMLInputElement, InputProps>(...)`
3. **Confusion** — new developers didn't understand why ref needed special treatment
4. **HOC complexity** — wrapping a forwardRef component in a HOC required re-forwarding the ref
5. **DisplayName** — forwardRef components showed as "ForwardRef" in DevTools unless you set displayName

#### React 19 Solution — `ref` Is Just a Regular Prop

React 19 stops intercepting `ref`. It passes through as a normal prop like `className` or `onClick`:

```jsx
// REACT 19 — ref is just a prop. Simple.
function MyInput({ ref, placeholder, className, ...props }) {
  return (
    <input
      ref={ref}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

// Usage — exactly the same for the consumer
function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <MyInput ref={inputRef} placeholder="Enter name" />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}
```

#### TypeScript — Before vs After

```typescript
// ❌ BEFORE React 19 — verbose forwardRef typing
interface InputProps {
  placeholder?: string;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const MyInput = forwardRef<HTMLInputElement, InputProps>(
  function MyInput({ placeholder, className, onChange }, ref) {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        className={className}
        onChange={onChange}
      />
    );
  }
);

// ✅ AFTER React 19 — clean and simple
interface InputProps {
  ref?: React.Ref<HTMLInputElement>;  // Just add ref to your props interface
  placeholder?: string;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

function MyInput({ ref, placeholder, className, onChange }: InputProps) {
  return (
    <input ref={ref} placeholder={placeholder} className={className} onChange={onChange} />
  );
}
```

#### Real-World Use Case 1: Design System Components

Design systems are where `forwardRef` pain was worst. Every component in your library needed it:

```jsx
// BEFORE — Every component in the design system needed forwardRef
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => { ... });
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => { ... });
const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => { ... });
const Dialog = forwardRef<HTMLDialogElement, DialogProps>((props, ref) => { ... });
// 50+ components all wrapped in forwardRef...

// AFTER React 19 — Just regular components
function Button({ ref, variant, size, children, ...props }: ButtonProps) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size }))} {...props}>
      {children}
    </button>
  );
}

function Input({ ref, label, error, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} aria-invalid={!!error} {...props} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

#### Real-World Use Case 2: Composing Refs in Complex Components

```jsx
// Focus management in a compound component
function SearchCombobox({ ref, onSearch, suggestions }) {
  const internalRef = useRef(null);
  
  // Merge external ref with internal ref
  const mergedRef = useMergedRef(ref, internalRef);

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      internalRef.current?.blur(); // Use internal ref for component logic
    }
  }

  return (
    <div role="combobox">
      <input
        ref={mergedRef}  // Both external consumer and internal logic can use this
        onKeyDown={handleKeyDown}
        onChange={e => onSearch(e.target.value)}
      />
      <ul role="listbox">
        {suggestions.map(s => <li key={s.id} role="option">{s.label}</li>)}
      </ul>
    </div>
  );
}

// Consumer can focus the input from outside
function Page() {
  const searchRef = useRef(null);
  return (
    <>
      <button onClick={() => searchRef.current?.focus()}>
        Press / to search
      </button>
      <SearchCombobox ref={searchRef} onSearch={handleSearch} suggestions={results} />
    </>
  );
}
```

#### Real-World Use Case 3: Ref Cleanup Functions (New in React 19)

React 19 also adds **ref cleanup functions** — return a function from a ref callback to run on unmount:

```jsx
function MeasuredBox({ ref }) {
  return (
    <div ref={(node) => {
      if (node) {
        // Setup: element mounted
        const observer = new ResizeObserver(entries => {
          console.log('Size changed:', entries[0].contentRect);
        });
        observer.observe(node);
        
        // Cleanup: element unmounted (NEW in React 19)
        return () => observer.disconnect();
      }
    }}>
      Resize me
    </div>
  );
}
```

Before React 19, ref callbacks received `null` on unmount, requiring awkward cleanup patterns. Now the cleanup function approach matches `useEffect` patterns.

#### Migration Path

```jsx
// If you have existing forwardRef code, React 19 supports both patterns
// forwardRef still works (not removed), but is no longer needed

// Gradually migrate:
// 1. Remove forwardRef wrapper
// 2. Move ref from second argument into props
// 3. Update TypeScript types

// BEFORE
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input ref={ref} {...props} />
));

// AFTER (one-line change)
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

---

### `<Context>` as Provider Directly — No `.Provider` Needed (React 19)

#### Theory: Why Did `.Provider` Exist?

When Context was introduced in React 16.3, the API was designed as:
- `createContext()` returns a Context **object** with two components: `.Provider` and `.Consumer`
- `.Provider` wraps the tree and supplies the value
- `.Consumer` reads the value (render prop pattern, later replaced by `useContext` hook)

```jsx
// The old mental model:
const ThemeContext = createContext('light');
// ThemeContext = {
//   Provider: <component that supplies value>,
//   Consumer: <component that reads value>  ← mostly unused now (useContext replaced it)
// }
```

The `.Provider` suffix was always just ceremony — there was no reason it couldn't be the Context itself.

#### React 19 Solution — Context IS the Provider

```jsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

// ❌ BEFORE React 19
function AppOld() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// ✅ AFTER React 19 — Context renders directly as Provider
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext value={theme}>
      <Toolbar />
    </ThemeContext>
  );
}
```

#### Real-World Use Case 1: Nested Providers (Cleaner Code)

Enterprise apps often have 5-10+ providers at the root. The `.Provider` suffix added noise:

```jsx
// ❌ BEFORE — "Provider soup" with extra noise
function AppProviders({ children }) {
  return (
    <AuthContext.Provider value={auth}>
      <ThemeContext.Provider value={theme}>
        <I18nContext.Provider value={i18n}>
          <NotificationContext.Provider value={notifications}>
            <FeatureFlagContext.Provider value={flags}>
              {children}
            </FeatureFlagContext.Provider>
          </NotificationContext.Provider>
        </I18nContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// ✅ AFTER React 19 — Cleaner, less visual noise
function AppProviders({ children }) {
  return (
    <AuthContext value={auth}>
      <ThemeContext value={theme}>
        <I18nContext value={i18n}>
          <NotificationContext value={notifications}>
            <FeatureFlagContext value={flags}>
              {children}
            </FeatureFlagContext>
          </NotificationContext>
        </I18nContext>
      </ThemeContext>
    </AuthContext>
  );
}
```

#### Real-World Use Case 2: Multi-Tenant Theming

```jsx
const TenantThemeContext = createContext(defaultTheme);

// Tenant-specific theme loaded from API/config
function TenantApp({ tenantConfig }) {
  const theme = useMemo(() => ({
    primary: tenantConfig.primaryColor,
    font: tenantConfig.fontFamily,
    logo: tenantConfig.logoUrl,
  }), [tenantConfig]);

  return (
    <TenantThemeContext value={theme}>
      <DashboardLayout />
    </TenantThemeContext>
  );
}

// Deep in the tree — any component reads tenant theme
function SidebarLogo() {
  const { logo, primary } = use(TenantThemeContext); // or useContext()
  return <img src={logo} style={{ borderColor: primary }} />;
}
```

#### Real-World Use Case 3: Compound Components with Shared State

```jsx
const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext value={{ activeTab, setActiveTab }}>
      <div role="tablist">{children}</div>
    </TabsContext>
  );
}

function TabTrigger({ value, children }) {
  const { activeTab, setActiveTab } = use(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabContent({ value, children }) {
  const { activeTab } = use(TabsContext);
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// Usage — clean compound component API
<Tabs defaultValue="overview">
  <TabTrigger value="overview">Overview</TabTrigger>
  <TabTrigger value="analytics">Analytics</TabTrigger>
  <TabTrigger value="settings">Settings</TabTrigger>

  <TabContent value="overview"><OverviewPanel /></TabContent>
  <TabContent value="analytics"><AnalyticsPanel /></TabContent>
  <TabContent value="settings"><SettingsPanel /></TabContent>
</Tabs>
```

#### Future: `.Provider` Will Be Deprecated

React 19 still supports `.Provider` for backwards compatibility, but it will be deprecated in a future version. Start writing new code without `.Provider` now.

---

### Suspense for Data Fetching with `use()` — Complete Deep Dive

#### Theory: What is Suspense, Really?

Suspense is React's mechanism for **declarative loading states**. Instead of imperative "if loading, show spinner," you declare what to show while content is loading, and React handles the lifecycle.

**The Mental Model:**

```
WITHOUT Suspense (imperative):
  Component manages its own loading → renders spinner → data arrives → re-renders with data
  Every component has its own loading/error state → boilerplate everywhere

WITH Suspense (declarative):
  Component ASSUMES data is available → if not, React "suspends" it
  Parent's <Suspense> boundary shows fallback automatically
  When data arrives, React replaces fallback with real content
  
Think of it like try/catch but for loading states:
  <Suspense fallback={...}>   ←  like "catch" for loading
    <Component />              ←  like "try" — assumes data exists
  </Suspense>
```

#### How Suspense Works Under the Hood

```
Step 1: React renders <Suspense fallback={<Spinner />}>
                         <UserProfile userPromise={promise} />
                       </Suspense>

Step 2: React starts rendering UserProfile
        → UserProfile calls use(userPromise)
        → Promise is still pending

Step 3: React THROWS the Promise (yes, literally throws it)
        → This is similar to how Error Boundaries catch thrown errors
        → Suspense catches thrown promises

Step 4: Suspense catches the promise
        → Renders fallback={<Spinner />} instead of UserProfile
        → Attaches a .then() listener to the thrown promise

Step 5: Promise resolves (data arrives)
        → Suspense re-renders UserProfile
        → use(userPromise) now returns the resolved value
        → UserProfile renders with actual data
        → <Spinner /> is replaced with real content

Step 6 (if Promise rejects):
        → The error propagates UP to the nearest Error Boundary
        → Error Boundary renders its fallback
```

#### Suspense Boundaries — Architecture Patterns

**Pattern 1: One Big Suspense (Simple but Poor UX)**

```jsx
// ❌ NOT IDEAL — entire dashboard shows spinner until ALL data loads
<Suspense fallback={<FullPageSpinner />}>
  <Header />           {/* Loads in 50ms */}
  <RevenueChart />     {/* Loads in 200ms */}
  <UserTable />        {/* Loads in 2000ms — everything waits for this! */}
</Suspense>
```

**Pattern 2: Per-Widget Suspense (Best UX)**

```jsx
// ✅ BEST — each widget loads independently
<Header />  {/* No data fetching, renders immediately */}

<div className="grid grid-cols-2 gap-4">
  <Suspense fallback={<ChartSkeleton />}>
    <RevenueChart />     {/* Shows skeleton for 200ms, then fills in */}
  </Suspense>
  
  <Suspense fallback={<TableSkeleton />}>
    <UserTable />        {/* Shows skeleton for 2000ms, then fills in */}
  </Suspense>
</div>
// Revenue chart appears in 200ms. User sees useful data FAST.
// User table fills in later. Neither blocks the other.
```

**Pattern 3: Nested Suspense (Progressive Disclosure)**

```jsx
// GOOD — outer shell loads fast, inner content loads progressively
<Suspense fallback={<PageSkeleton />}>
  <DashboardLayout>                    {/* Loads fast: sidebar, header */}
    <Suspense fallback={<MetricsSkeleton />}>
      <MetricsRow />                    {/* Loads medium: 4 metric cards */}
      <Suspense fallback={<ChartSkeleton />}>
        <DetailedAnalytics />           {/* Loads slow: heavy charts */}
      </Suspense>
    </Suspense>
  </DashboardLayout>
</Suspense>

// Timeline:
// t=0ms:    <PageSkeleton />
// t=100ms:  Sidebar + Header appear, <MetricsSkeleton /> in content area
// t=400ms:  Metric cards appear, <ChartSkeleton /> below them
// t=1500ms: Detailed charts fill in
```

#### Suspense + Error Boundary — The Enterprise Pattern

For production dashboards, EVERY Suspense boundary should be paired with an Error Boundary:

```jsx
// Reusable wrapper component
function AsyncWidget({ fallback, errorFallback, children }) {
  return (
    <ErrorBoundary fallback={errorFallback || <WidgetError />}>
      <Suspense fallback={fallback || <WidgetSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Dashboard with isolated widgets — if one crashes, others survive
function EnterpriseDashboard() {
  const revenue = fetchRevenue();
  const users = fetchUsers();
  const errors = fetchErrors();

  return (
    <div className="grid grid-cols-3 gap-4">
      <AsyncWidget fallback={<MetricSkeleton />}>
        <RevenueWidget dataPromise={revenue} />
      </AsyncWidget>
      
      <AsyncWidget fallback={<MetricSkeleton />}>
        <UsersWidget dataPromise={users} />
      </AsyncWidget>
      
      <AsyncWidget fallback={<ChartSkeleton />}>
        <ErrorRateChart dataPromise={errors} />
      </AsyncWidget>
    </div>
  );
}
```

**Why pair them:** If the API returns a 500, the Promise rejects. Without an Error Boundary, the entire page crashes. With per-widget Error Boundaries, only the broken widget shows an error — the rest of the dashboard keeps working. This is critical for enterprise clients like HDFC Bank who can't have their entire dashboard go down because one API is slow.

---

### Streaming SSR with Suspense Boundaries — Complete Deep Dive

#### Theory: The Problem with Traditional SSR

**Traditional SSR (React 17 and before)** was all-or-nothing:

```
Traditional SSR Timeline:
─────────────────────────────────────────────────────────────
1. Browser sends request
2. Server FETCHES ALL DATA (waits for slowest query — 3 seconds)
3. Server RENDERS ALL HTML (waits for full render)
4. Server sends COMPLETE HTML to browser in one chunk
5. Browser shows full page (but not interactive yet)
6. Browser downloads JS bundle
7. React HYDRATES entire page (attaches event handlers)
8. Page is now interactive
─────────────────────────────────────────────────────────────
Time to first byte: 3+ seconds (waiting for ALL data)
Time to interactive: 5+ seconds
```

**Problems:**
1. **Blocked by slowest query** — if one API takes 3 seconds, the ENTIRE page waits 3 seconds
2. **All-or-nothing HTML** — user sees nothing until everything is ready
3. **All-or-nothing hydration** — even if header JS is loaded, it can't be interactive until footer JS is loaded too

#### Streaming SSR (React 18+) — The Solution

With Streaming SSR, the server sends HTML in **chunks** as data becomes available:

```
Streaming SSR Timeline:
─────────────────────────────────────────────────────────────
1. Browser sends request
2. Server IMMEDIATELY starts sending HTML:
   → <html><head>...</head><body>
   → <header>...</header>              ← Visible immediately!
   → <div id="metrics">Loading...</div> ← Suspense fallback as HTML
   → <div id="chart">Loading...</div>   ← Another Suspense fallback
   
3. Metrics API responds (500ms):
   → Server streams: <script>replace #metrics with real content</script>
   → Browser swaps "Loading..." with actual metrics
   
4. Chart API responds (2000ms):
   → Server streams: <script>replace #chart with real content</script>
   → Browser swaps "Loading..." with actual chart
   
5. Selective hydration: React hydrates each chunk as it arrives
   → Header is interactive immediately
   → Metrics become interactive when their JS loads
   → Chart becomes interactive when its JS loads
─────────────────────────────────────────────────────────────
Time to first byte: ~50ms (instant HTML shell)
Time to first useful content: ~500ms (metrics visible)
Time to full page: ~2000ms (chart fills in)
```

#### How Streaming SSR Works in Next.js — Step by Step

```jsx
// app/dashboard/page.tsx (Server Component)
import { Suspense } from 'react';

export default async function DashboardPage() {
  return (
    <div>
      {/* PHASE 1: Renders immediately — sent in first HTML chunk */}
      <DashboardHeader user={await getUser()} />
      
      {/* PHASE 2: Server starts fetching. Sends fallback HTML immediately.
          When data arrives, streams the real content. */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsRow />
      </Suspense>
      
      {/* PHASE 3: Independent stream — loads whenever its data arrives */}
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>
      
      {/* PHASE 4: Slowest data — streams in last */}
      <Suspense fallback={<TableSkeleton />}>
        <AuditLogTable />
      </Suspense>
    </div>
  );
}

// Each async component fetches its own data on the server
async function MetricsRow() {
  const metrics = await fetchMetrics(); // 300ms
  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map(m => (
        <MetricCard key={m.id} label={m.label} value={m.value} trend={m.trend} />
      ))}
    </div>
  );
}

async function AnalyticsChart() {
  const data = await fetchAnalytics(); // 1200ms
  return <ChartComponent data={data} />;
}

async function AuditLogTable() {
  const logs = await fetchAuditLogs(); // 2500ms
  return <DataTable rows={logs} columns={auditColumns} />;
}
```

#### What the Browser Receives — The Actual HTML Stream

```html
<!-- CHUNK 1: Sent immediately (t=0ms) -->
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <header>Dashboard - Welcome, Dharma</header>
  
  <!-- Suspense fallback rendered as real HTML -->
  <div id="S:1">
    <div class="metrics-skeleton">Loading metrics...</div>
  </div>
  <div id="S:2">
    <div class="chart-skeleton">Loading chart...</div>
  </div>
  <div id="S:3">
    <div class="table-skeleton">Loading audit logs...</div>
  </div>

<!-- CHUNK 2: Streamed when metrics data arrives (t=300ms) -->
<div hidden id="B:1">
  <!-- Real metrics HTML -->
  <div class="grid grid-cols-4 gap-4">
    <div class="metric-card">Revenue: $1.8M ↑12%</div>
    <div class="metric-card">Users: 15,420 ↑8%</div>
    ...
  </div>
</div>
<script>
  // React's streaming script: swap fallback with real content
  $RC("S:1", "B:1");
</script>

<!-- CHUNK 3: Streamed when chart data arrives (t=1200ms) -->
<div hidden id="B:2">
  <canvas class="analytics-chart">...</canvas>
</div>
<script>$RC("S:2", "B:2");</script>

<!-- CHUNK 4: Streamed when audit log data arrives (t=2500ms) -->
<div hidden id="B:3">
  <table class="audit-table">...</table>
</div>
<script>$RC("S:3", "B:3");</script>

</body>
</html>
```

#### Selective Hydration — The Performance Multiplier

Traditional hydration was all-or-nothing: React had to hydrate the entire page before anything was interactive. Streaming SSR enables **selective hydration:**

```
Traditional Hydration:
──────────────────────────────────────────
Download ALL JS → Hydrate EVERYTHING → Interactive
Nothing is interactive until everything is hydrated

Selective Hydration (React 18+ with Streaming):
──────────────────────────────────────────
Header JS loads    → Hydrate header    → Header interactive ✅
Metrics JS loads   → Hydrate metrics   → Metrics interactive ✅
Chart JS loads     → Hydrate chart     → Chart interactive ✅
Table JS loads     → Hydrate table     → Table interactive ✅

Each section becomes interactive INDEPENDENTLY
```

**Priority-based hydration:** If the user clicks on a Suspense boundary that hasn't hydrated yet, React **prioritizes** hydrating that section. The user's interaction tells React what matters most.

```jsx
// User clicks the chart area before it's hydrated
// React sees: "User wants to interact with chart"
// React: prioritizes hydrating AnalyticsChart OVER AuditLogTable
<Suspense fallback={<ChartSkeleton />}>
  <AnalyticsChart />  {/* ← User clicked here — React hydrates this first */}
</Suspense>
<Suspense fallback={<TableSkeleton />}>
  <AuditLogTable />   {/* ← Deferred — user hasn't interacted with this */}
</Suspense>
```

#### Real-World Use Case: E-Commerce Product Page

```jsx
// app/product/[id]/page.tsx
export default async function ProductPage({ params }) {
  // Fast data — fetched first, sent in initial HTML
  const product = await fetchProduct(params.id); // 100ms

  return (
    <div>
      {/* IMMEDIATE: Product info (fast API, critical for SEO) */}
      <ProductInfo product={product} />
      <AddToCartButton product={product} />

      {/* STREAMED: Reviews (slower API, below the fold) */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <CustomerReviews productId={params.id} />
      </Suspense>

      {/* STREAMED: Recommendations (ML model, slowest) */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <PersonalizedRecommendations productId={params.id} userId={userId} />
      </Suspense>

      {/* STREAMED: Q&A section */}
      <Suspense fallback={<QASkeleton />}>
        <QuestionAnswers productId={params.id} />
      </Suspense>
    </div>
  );
}
```

**Result:**
- **LCP: ~200ms** — Product image + name + price visible almost instantly
- **SEO: Perfect** — Critical product info in initial HTML, Google doesn't need JS
- **UX: Progressive** — Reviews appear in 800ms, recommendations in 2s
- **No waterfall** — All Suspense boundaries fetch independently on the server

#### Streaming SSR vs Regular SSR vs CSR — Complete Comparison

| Feature | CSR (Client Rendering) | Traditional SSR | Streaming SSR |
|---------|----------------------|-----------------|---------------|
| **First paint** | Slow (blank until JS loads) | Medium (blocked by slowest query) | Fast (instant HTML shell) |
| **SEO** | Poor (empty HTML) | Good (full HTML) | Best (immediate HTML + progressive fill) |
| **Time to interactive** | Fast (once JS loads) | Slow (hydrate everything) | Progressive (selective hydration) |
| **Blocked by slow API** | Only that component | ENTIRE page | Only that Suspense boundary |
| **Server load** | Low (client does work) | High (render everything) | Medium (stream as ready) |
| **LCP** | Poor | Good | Best |
| **CLS** | Risk (content shifts) | Zero (full HTML) | Low (skeletons → content) |
| **When to use** | SPAs behind auth, heavy interactivity | Simple pages, few data sources | Dashboards, mixed fast/slow data |

#### Interview Answer Framework

"For a data-heavy dashboard like TartanHQ's analytics console, I'd use **Streaming SSR with Suspense boundaries**. The server sends the dashboard shell immediately — sidebar, header, and navigation are visible within 100ms. Each metric widget is wrapped in its own `<Suspense>` boundary, so they fetch data independently on the server and stream HTML to the browser as each API responds. The fastest metrics appear in 200-300ms, while slower queries like detailed charts fill in over the next 1-2 seconds.

Each widget also gets its own Error Boundary, so if one API is down, only that widget shows an error — the rest of the dashboard keeps working. This is critical for enterprise clients like HDFC Bank who can't have their entire dashboard go down because one microservice is slow.

The key architectural decision is **where to place Suspense boundaries**. Too many boundaries = too many skeletons flickering in. Too few = slow content blocks fast content. I aim for one boundary per independent data source."

---

## 1.3 React Compiler (React Forget) — `MEDIUM PRIORITY`

### Theory: What Problem Does React Compiler Solve?

React has a fundamental performance problem: **unnecessary re-renders**. When a parent component's state changes, React re-renders ALL its children, even if their props haven't changed. Developers fought this with three manual tools:

```jsx
// The 3 tools developers had to manually apply:
const memoizedValue = useMemo(() => expensiveCalc(a, b), [a, b]);
const memoizedFn = useCallback(() => handleClick(id), [id]);
const MemoChild = React.memo(ChildComponent);
```

**The problem with manual memoization:**
1. **Developers forget** — most components that SHOULD be memoized aren't
2. **Over-memoization** — some developers memoize EVERYTHING, wasting memory on cheap computations
3. **Wrong dependencies** — stale closures, missing deps, or unnecessary deps break correctness
4. **Code noise** — wrapping everything in useMemo/useCallback/React.memo makes code harder to read
5. **Diminishing returns** — you need to memoize the ENTIRE chain (parent callback + child memo) for it to work

**React Compiler's solution:** Automatically analyze your code at build time and insert memoization exactly where it helps — no manual intervention needed.

### How React Compiler Works Internally

```
YOUR CODE                           COMPILED OUTPUT
─────────────────                   ─────────────────
function Product({ item }) {        function Product({ item }) {
  const price = formatPrice(          // Compiler auto-memoizes:
    item.price,                       const price = useMemo(
    item.currency                       () => formatPrice(item.price, item.currency),
  );                                    [item.price, item.currency]
                                      );
  return (
    <div>                             // Compiler auto-memoizes JSX:
      <h2>{item.name}</h2>            return useMemo(() => (
      <span>{price}</span>              <div>
    </div>                                <h2>{item.name}</h2>
  );                                      <span>{price}</span>
}                                       </div>
                                      ), [item.name, price]);
                                    }
```

The compiler uses **static analysis** (AST parsing) to:
1. Track which variables each expression depends on
2. Determine which expressions are pure (no side effects)
3. Wrap pure expressions in memoization with correct dependency arrays
4. Skip memoization where the cost of comparing deps exceeds the render cost

### What React Compiler CANNOT Do

```jsx
// ❌ Compiler CANNOT fix code that violates Rules of React
function BadComponent() {
  let count = 0;
  
  // Side effect during render — compiler can't memoize this safely
  count = document.querySelectorAll('.item').length;
  
  // Mutating props — violates immutability
  props.items.sort(); // sort mutates the array!
  
  return <div>{count}</div>;
}

// ✅ Compiler CAN optimize this (follows Rules of React)
function GoodComponent({ items }) {
  // Pure computation — safe to memoize
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  const total = sorted.reduce((sum, item) => sum + item.price, 0);
  
  return <div>Total: {total}</div>;
}
```

### Real-World Impact (Production Numbers)

**Meta's deployment results:**
- **Instagram:** ~3% average improvement across all interactions
- **Quest Store:** Up to 12% faster initial page load
- **Internal tools:** 5-15% reduction in re-renders across dashboards

These might seem small, but at Meta's scale (billions of renders/day), even 3% means millions of faster interactions.

### How to Enable It

```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      // Options
      runtimeModule: 'react-compiler-runtime', // Custom runtime if needed
    }],
  ],
};

// Or in Next.js next.config.js:
module.exports = {
  experimental: {
    reactCompiler: true,
  },
};
```

### Interview Answer

"React Compiler is an ahead-of-time Babel plugin that auto-inserts memoization. It eliminates manual useMemo/useCallback/React.memo by analyzing code at build time and only memoizing where it helps. Meta deployed it on Instagram with ~3% improvement. The catch is your code must follow Rules of React — no side effects during render, no mutation. In my current work, I still use manual memoization because the compiler is in gradual rollout, but I write code that's compiler-ready by keeping renders pure."

---

## 1.4 Reconciliation & Virtual DOM — `HIGH PRIORITY`

### Theory: Why Does the Virtual DOM Exist?

**The Core Problem:** DOM manipulation is slow. Every time you change the DOM, the browser must:
1. Recalculate CSS styles (Recalculate Style)
2. Compute the layout of every element (Layout/Reflow)
3. Repaint pixels on screen (Paint)
4. Composite layers together (Composite)

Changing one `<div>` can trigger layout recalculation for hundreds of elements. If you have a list of 1000 items and update one, naively touching the DOM for each change would be catastrophically slow.

**React's Solution — Virtual DOM:**
React keeps a lightweight JavaScript object tree (Virtual DOM) that mirrors the real DOM. When state changes:

```
Step 1: Create NEW Virtual DOM tree (fast — just JS objects)
Step 2: DIFF the new tree against the old tree (fast — O(n) algorithm)  
Step 3: Compute the MINIMUM set of DOM operations needed
Step 4: Apply ONLY those operations to the real DOM (minimal, batched)
```

### How the Diffing Algorithm Works — Step by Step

React uses two heuristics to achieve O(n) time instead of the theoretical O(n³):

**Heuristic 1: Different Types = Full Rebuild**

```jsx
// Old tree               New tree
<div>                     <section>
  <Counter />               <Counter />
</div>                    </section>

// React's decision: <div> ≠ <section> → DESTROY entire subtree
// Counter component is UNMOUNTED (state lost!) and re-created
// This is fast because React doesn't waste time comparing children
```

**Heuristic 2: Same Type = Update Props**

```jsx
// Old tree               New tree  
<div className="old"      <div className="new"
     style={{color: 'red'}}>    style={{color: 'blue'}}>
  <Counter />               <Counter />
</div>                    </div>

// React's decision: <div> === <div> → keep DOM node
// Only update: className "old" → "new", color "red" → "blue"
// Counter is PRESERVED — state survives!
```

**Heuristic 3: Keys for List Children**

Without keys, React matches children by index:
```jsx
// Old list (no keys):        New list (inserted at top):
<ul>                          <ul>
  <li>Alice</li>  ← index 0    <li>Zara</li>   ← index 0 (React: "Alice→Zara" — UPDATE)
  <li>Bob</li>    ← index 1    <li>Alice</li>  ← index 1 (React: "Bob→Alice" — UPDATE)
</ul>                           <li>Bob</li>    ← index 2 (React: NEW — INSERT)
                              </ul>
// React updates 2 items + inserts 1 = 3 operations
// But the OPTIMAL solution is just 1 insert (Zara at top)!

// With keys:
<ul>                          <ul>
  <li key="a">Alice</li>       <li key="z">Zara</li>  ← NEW key → INSERT
  <li key="b">Bob</li>         <li key="a">Alice</li> ← same key → MOVE (no update)
</ul>                           <li key="b">Bob</li>   ← same key → MOVE (no update)
                              </ul>
// React: 1 insert + 2 moves = much less DOM work
```

### Real-World Consequence: The `key={index}` Bug

```jsx
// SCENARIO: Editable todo list with index keys
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Walk dog' },
    { id: 3, text: 'Code review' },
  ]);

  const removeTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  return (
    <ul>
      {todos.map((todo, index) => (
        // ❌ key={index} — BUG when items are removed
        <li key={index}>
          <input defaultValue={todo.text} />
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// BUG: Delete "Buy milk" (index 0)
// Before: index 0 = "Buy milk", index 1 = "Walk dog", index 2 = "Code review"
// After:  index 0 = "Walk dog", index 1 = "Code review"
// React thinks: index 0 still exists, just update its text prop
// BUT the <input> DOM element at index 0 still has "Buy milk" typed in it!
// Result: input shows "Buy milk" but the data says "Walk dog" — UI/data mismatch

// ✅ FIX: key={todo.id}
// React correctly identifies which element was removed and destroys it
```

### Fiber Architecture — Deep Dive

**Why Fiber was needed (the problem with the Stack Reconciler):**

Before React 16, the reconciler used a recursive, synchronous algorithm:

```
Stack Reconciler (React 15):
render(App)
  └── render(Dashboard)
        └── render(Widget1)
              └── render(Chart)    ← If this takes 100ms...
        └── render(Widget2)        ← ...this waits 100ms
        └── render(Widget3)        ← ...this waits too

// The ENTIRE tree renders in one synchronous call
// If it takes 200ms, the browser is FROZEN for 200ms
// No animations, no scrolling, no typing — dead UI
```

**Fiber's solution — Interruptible Rendering:**

```
Fiber Reconciler (React 16+):
render(App)                    ← Unit of work 1 (1ms)
  yield to browser             ← Browser handles user input, animations
render(Dashboard)              ← Unit of work 2 (1ms)
  yield to browser
render(Widget1)                ← Unit of work 3 (1ms)
  yield to browser
  ⚠️ User clicks a button!    ← HIGH PRIORITY EVENT
render(ButtonHandler)          ← React drops current work, handles click
  yield to browser
render(Widget1) RESUMED        ← Back to previous work
```

**How Fiber achieves this:**

Each component becomes a **Fiber node** — a JavaScript object:

```javascript
// Simplified Fiber node structure
{
  type: Dashboard,              // Component function/class
  key: null,
  child: Widget1Fiber,          // First child
  sibling: Widget2Fiber,        // Next sibling
  return: AppFiber,             // Parent
  stateNode: domElement,        // Actual DOM node (for host components)
  memoizedState: { count: 5 },  // Hooks state linked list
  pendingProps: { data: [...] },
  flags: Update | Placement,    // What needs to happen to this node
  lanes: TransitionLane,        // Priority level
}
```

React walks this linked list structure (child → sibling → return) instead of recursing. At any point, it can stop, save its position, handle urgent work, and resume later.

### Priority Lanes

React 18 uses a **lane-based priority system:**

```
SyncLane            → Highest: discrete user input (clicks, typing)
InputContinuousLane → High: continuous input (drag, scroll)
DefaultLane         → Normal: regular state updates
TransitionLane      → Low: startTransition() updates
IdleLane            → Lowest: offscreen/prefetch work

Example:
User types in search box while a heavy list is rendering:
1. List rendering is in TransitionLane (low priority)
2. Keystroke triggers SyncLane update (high priority)
3. React INTERRUPTS list rendering
4. Handles keystroke immediately (input stays responsive)
5. Resumes list rendering after
```

### Real-World Use Case: Dashboard with Mixed Priority Updates

```jsx
function AnalyticsDashboard() {
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState(allData);
  
  function handleFilterChange(e) {
    // URGENT: Update input immediately (SyncLane)
    setFilter(e.target.value);
    
    // NON-URGENT: Filter 100K rows (TransitionLane)
    startTransition(() => {
      setResults(allData.filter(row => 
        row.name.toLowerCase().includes(e.target.value.toLowerCase())
      ));
    });
  }
  
  // Input is ALWAYS responsive, even if filtering takes 500ms
  // Without Fiber + lanes, typing would feel laggy
}
```

---

## 1.5 Concurrent Features — `HIGH PRIORITY`

### Theory: What is "Concurrent" React?

Traditional React rendering is like a **phone call** — once React starts rendering, it must finish before doing anything else. Concurrent React is like **texting** — React can pause a render, handle something more urgent, and come back.

**Concurrency in React does NOT mean parallelism.** React still runs on a single thread. "Concurrent" means React can:
1. **Interrupt** a low-priority render to handle high-priority updates
2. **Prepare** multiple versions of the UI in memory simultaneously
3. **Discard** renders that are no longer needed (stale data)

### `useTransition` — Deep Dive

#### What Problem Does It Solve?

```jsx
// ❌ WITHOUT useTransition — UI freezes during heavy state update
function TabContainer() {
  const [activeTab, setActiveTab] = useState('overview');
  
  function selectTab(tab) {
    setActiveTab(tab); // This triggers re-render of tab content
    // If AnalyticsTab renders 50,000 rows → UI freezes for 500ms
    // User's click on the tab feels sluggish
  }
  
  return (
    <div>
      <TabButton onClick={() => selectTab('overview')}>Overview</TabButton>
      <TabButton onClick={() => selectTab('analytics')}>Analytics</TabButton>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}  {/* Heavy render */}
    </div>
  );
}
```

The problem: switching to the Analytics tab triggers a 500ms render. During that time, the button doesn't show its active state, hover effects don't work, and the UI feels frozen.

```jsx
// ✅ WITH useTransition — UI stays responsive
function TabContainer() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();
  
  function selectTab(tab) {
    startTransition(() => {
      setActiveTab(tab); // Marked as non-urgent — can be interrupted
    });
  }
  
  return (
    <div>
      <TabButton 
        onClick={() => selectTab('overview')}
        isActive={activeTab === 'overview'}
      >
        Overview
      </TabButton>
      <TabButton 
        onClick={() => selectTab('analytics')}
        isActive={activeTab === 'analytics'}
      >
        Analytics {isPending && <Spinner size="small" />}
      </TabButton>
      
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}
```

**What happens internally:**
1. User clicks "Analytics" tab
2. `startTransition` marks the `setActiveTab` update as **TransitionLane** (low priority)
3. React starts rendering AnalyticsTab in memory
4. If user clicks something else during the render → React INTERRUPTS and handles the click
5. While rendering, `isPending` is `true` → you can show a spinner or dim the content
6. When rendering completes → React commits the update and `isPending` becomes `false`

### `useDeferredValue` — Deep Dive

#### What Problem Does It Solve?

`useDeferredValue` solves the same problem as `useTransition` but from a different angle — when you DON'T control the state update (it comes from a prop or a parent).

```jsx
// SCENARIO: Search input + heavy results list
// You control the input state but the results component receives query as prop

function SearchPage() {
  const [query, setQuery] = useState('');
  
  // query updates immediately (input stays responsive)
  // deferredQuery updates with LOWER PRIORITY (results can lag behind)
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery; // True while results are stale
  
  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        placeholder="Search 100K products..."
      />
      <div style={{ opacity: isStale ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults query={deferredQuery} />
        </Suspense>
      </div>
    </div>
  );
}

// This component does heavy filtering — 100K items
function SearchResults({ query }) {
  const products = use(searchProducts(query));
  return (
    <ul>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}
```

**What happens when user types "react" quickly:**
1. User types "r" → `query` = "r", `deferredQuery` = "" (stale, dimmed)
2. User types "re" → `query` = "re", `deferredQuery` = "r" (React interrupts "r" search, starts "re")
3. User types "rea" → `query` = "rea", `deferredQuery` = "re" (React interrupts again)
4. User stops typing → React completes "rea" search → `deferredQuery` = "rea" → results show

React **discards intermediate renders** ("r", "re") and only completes the final one ("rea"). No wasted work.

### Real-World Use Case: Live Dashboard Filter

```jsx
function APIAnalyticsDashboard() {
  const [filters, setFilters] = useState({
    client: 'all',
    dateRange: 'last7d',
    status: 'all',
    endpoint: '',
  });
  
  // Deferred version of filters — chart/table updates lag behind filter changes
  const deferredFilters = useDeferredValue(filters);
  const isStale = filters !== deferredFilters;
  
  return (
    <div className="grid grid-cols-[300px_1fr]">
      {/* Filter sidebar — always responsive */}
      <FilterPanel
        filters={filters}
        onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
      />
      
      {/* Dashboard content — uses deferred filters */}
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        {isStale && <div className="absolute top-2 right-2"><Spinner /></div>}
        
        <Suspense fallback={<ChartSkeleton />}>
          <MetricsChart filters={deferredFilters} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <APICallsTable filters={deferredFilters} />
        </Suspense>
      </div>
    </div>
  );
}
```

**Why this matters for TartanHQ:** Their dashboard shows API analytics for 50+ enterprise clients. When a user changes the client filter dropdown, the chart needs to re-render with potentially 100K+ data points. Without `useDeferredValue`, the dropdown would freeze while the chart re-computes. With it, the dropdown updates instantly and the chart follows with a brief dimming effect.

### `useTransition` vs `useDeferredValue` — Decision Framework

```
ASK: "Do I control the state update?"

YES, I call setState directly
  └── Use useTransition
      └── Wrap the setState call in startTransition()
      
NO, I receive a value as prop
  └── Use useDeferredValue
      └── Defer the prop value
      
BOTH work? Choose:
  useTransition → when you need isPending for loading indicators
  useDeferredValue → when you want to dim stale content
```

### Suspense — Why It's More Than a Loading Spinner

#### Theory: Declarative vs Imperative Loading States

```jsx
// ❌ IMPERATIVE approach — every component manages its own loading
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { /* fetch logic */ }, [userId]);

  // YOU manually decide what to render in each state
  if (loading) return <Spinner />;
  if (error) return <Error />;
  return <Profile user={user} />;
}

// Problems:
// 1. Every data-fetching component has 3 extra state variables
// 2. Loading state is INSIDE the component — parent can't control it
// 3. Multiple components = multiple independent spinners = visual chaos
// 4. No coordination — can't say "show skeleton until ALL children are ready"

// ✅ DECLARATIVE approach — parent defines loading strategy
<Suspense fallback={<ProfileSkeleton />}>
  <UserProfile userId={id} />
</Suspense>

// Benefits:
// 1. UserProfile assumes data exists — zero loading state code
// 2. Parent controls the loading experience
// 3. You can GROUP multiple components under one Suspense
// 4. Nest Suspense for progressive loading
```

#### Real-World: SaaS Settings Page with Multiple Data Sources

```jsx
// Each section fetches different data at different speeds
function SettingsPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      
      {/* Fast: user profile from JWT/session */}
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileSection />           {/* 50ms */}
      </Suspense>
      
      {/* Medium: billing from Stripe API */}
      <Suspense fallback={<BillingSkeleton />}>
        <BillingSection />            {/* 500ms */}
      </Suspense>
      
      {/* Slow: usage analytics from data warehouse */}
      <Suspense fallback={<UsageSkeleton />}>
        <UsageAnalytics />            {/* 2000ms */}
      </Suspense>
      
      {/* Group: these two should load together or not at all */}
      <Suspense fallback={<TeamSkeleton />}>
        <TeamMembers />               {/* 300ms */}
        <TeamPermissions />           {/* 400ms */}
        {/* Both show skeleton until BOTH are ready — consistent UI */}
      </Suspense>
    </div>
  );
}
```

---

## 1.6 Render Optimization Patterns — `HIGH PRIORITY`

### Theory: Why Do Unnecessary Re-renders Happen?

React re-renders a component when:
1. Its state changes (useState setter called)
2. Its parent re-renders (even if props haven't changed)
3. Its context value changes

Rule #2 is the source of most performance problems. By default, when a parent re-renders, ALL its children re-render — even if their props are identical.

```jsx
function Parent() {
  const [count, setCount] = useState(0); // Only Parent uses this
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveChild />  {/* RE-RENDERS on every count change! */}
      <AnotherChild />    {/* RE-RENDERS too! */}
      <YetAnotherChild /> {/* And this one! */}
    </div>
  );
}
// Clicking the button re-renders Parent + ALL 3 children
// Even though none of the children use `count`
```

### Pattern 1: Children Composition — HOW and WHY It Works

```jsx
// ✅ THE FIX: Lift state into a wrapper, pass expensive part as children
function Counter({ children }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children}
    </div>
  );
}

function Parent() {
  return (
    <Counter>
      <ExpensiveChild />  {/* Does NOT re-render when count changes! */}
    </Counter>
  );
}
```

**WHY this works — the deep explanation:**

```
When Parent renders, it creates this JSX:
  <Counter>
    <ExpensiveChild />  ← This React element is created HERE, in Parent
  </Counter>

The <ExpensiveChild /> element is a JavaScript object:
  { type: ExpensiveChild, props: {}, key: null }

This object is created during Parent's render.
Since Parent's state hasn't changed, Parent doesn't re-render.
Since Parent doesn't re-render, this object is the SAME reference.

When Counter re-renders (count changes):
  - Counter receives `children` prop
  - `children` is the SAME object reference as before
  - React sees: same reference → skip re-render
  
This is React's built-in optimization — not React.memo!
```

### Pattern 2: State Colocation — The Most Underrated Pattern

**Theory:** Every piece of state has a "natural home" — the closest common ancestor of all components that use it. Putting state higher than necessary causes unnecessary re-renders for components that don't need it.

```jsx
// ❌ BAD: Search state lives in Page — entire page re-renders on every keystroke
function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  return (
    <div>
      <Header />                    {/* Re-renders on every keystroke! */}
      <Sidebar                       {/* Re-renders on every keystroke! */}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <SearchBar                     {/* Only this needs searchQuery */}
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
      <ProductGrid                   {/* Re-renders on every keystroke! */}
        category={selectedCategory}
        search={searchQuery}
      />
      <Footer />                     {/* Re-renders on every keystroke! */}
    </div>
  );
}

// ✅ GOOD: Move search state INTO SearchBar (colocate it)
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState(''); // State lives where it's used
  
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    onSearch(debouncedQuery); // Only notify parent after debounce
  }, [debouncedQuery, onSearch]);
  
  return (
    <input value={query} onChange={e => setQuery(e.target.value)} />
  );
  // Now typing re-renders ONLY SearchBar — not the entire page
}
```

### Pattern 3: Context Splitting — Why a Single Context Kills Performance

```jsx
// ❌ DISASTER: One context with everything
const AppContext = createContext({
  user: null,        // Changes rarely (login/logout)
  theme: 'light',    // Changes rarely (toggle)
  notifications: [], // Changes frequently (new notifications every few seconds)
  cart: [],          // Changes moderately (add/remove items)
});

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext value={state}>{children}</AppContext>
  );
}

// PROBLEM: When a new notification arrives:
// 1. notifications array changes
// 2. AppContext value is a NEW object reference
// 3. EVERY component that reads ANY part of AppContext re-renders
// 4. Header (uses user) re-renders — even though user didn't change
// 5. ThemeToggle (uses theme) re-renders — even though theme didn't change
// 6. CartIcon (uses cart) re-renders — even though cart didn't change

// ✅ FIX: Split into separate contexts by change frequency
const UserContext = createContext(null);          // Changes: rarely
const ThemeContext = createContext('light');        // Changes: rarely
const NotificationContext = createContext([]);      // Changes: frequently
const CartContext = createContext([]);              // Changes: moderately

// Now when notifications update:
// Only components reading NotificationContext re-render
// Header (reads UserContext) is completely unaffected
```

**Advanced technique — separate state and dispatch contexts:**

```jsx
const TodoStateContext = createContext(null);
const TodoDispatchContext = createContext(null);

function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);
  return (
    <TodoStateContext value={todos}>
      <TodoDispatchContext value={dispatch}>
        {children}
      </TodoDispatchContext>
    </TodoStateContext>
  );
}

// Components that only ADD todos (dispatch) don't re-render when todos change
function AddTodoButton() {
  const dispatch = useContext(TodoDispatchContext); // dispatch never changes!
  return <button onClick={() => dispatch({ type: 'ADD' })}>Add</button>;
}

// Components that only READ todos do re-render when todos change
function TodoList() {
  const todos = useContext(TodoStateContext);
  return todos.map(t => <TodoItem key={t.id} todo={t} />);
}
```

### Pattern 4: Virtualization — When and Why

**Theory:** The browser has a hard limit on how many DOM nodes it can manage efficiently. Beyond ~1,000-2,000 visible nodes, you start hitting performance walls:

```
DOM Nodes    | Paint Time  | Memory   | Interaction Responsiveness
─────────────|─────────────|──────────|─────────────────────────
100 nodes    | ~2ms        | ~5MB     | Instant
1,000 nodes  | ~15ms       | ~20MB    | Good
10,000 nodes | ~150ms      | ~100MB   | Laggy
100,000 nodes| ~1500ms     | ~500MB+  | Frozen/Crashed
```

**Virtualization renders ONLY visible items** — typically 10-30 DOM nodes regardless of list size.

### Real-World Use Case: API Call Log Table (100K+ Rows)

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function APICallLogTable({ logs }) {
  // logs could be 100,000+ rows
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,        // Estimated row height in px
    overscan: 10,                   // Render 10 extra rows above/below viewport
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      {/* Total height div — creates the scrollbar */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const log = logs[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                height: virtualRow.size,
                width: '100%',
              }}
              className="flex items-center border-b"
            >
              <span className="w-32">{log.timestamp}</span>
              <span className="w-24">{log.method}</span>
              <span className="flex-1">{log.endpoint}</span>
              <span className={`w-16 ${log.status >= 400 ? 'text-red-500' : 'text-green-500'}`}>
                {log.status}
              </span>
              <span className="w-20">{log.latency}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
  // 100,000 logs but only ~25 DOM nodes rendered at any time
  // Scrolling is buttery smooth
}
```

---

## 1.7 Error Handling — `MEDIUM PRIORITY`

### Theory: Why Error Boundaries Are Class Components

Error Boundaries catch JavaScript errors during rendering, lifecycle methods, and constructors of the whole tree below them. They use two class lifecycle methods that have NO hook equivalents:

1. `static getDerivedStateFromError(error)` — called during render phase, updates state to show fallback
2. `componentDidCatch(error, errorInfo)` — called during commit phase, for side effects (logging)

**Why no hook equivalent exists:** These methods need to catch errors thrown DURING render. Hooks run during render too — a hook can't catch an error thrown by itself or other hooks in the same component. It's a fundamental architecture limitation. The React team may add a `useErrorBoundary` hook in the future, but for now, class components are required.

### The `react-error-boundary` Library — Production Pattern

```jsx
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';

// Reusable error fallback with retry
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded">
      <h3 className="font-bold text-red-800">Something went wrong</h3>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-100 rounded hover:bg-red-200"
      >
        Try again
      </button>
    </div>
  );
}

// Dashboard with per-widget error isolation
function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Each widget is independently protected */}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => queryClient.invalidateQueries({ queryKey: ['revenue'] })}
        onError={(error, info) => {
          // Log to Sentry/DataDog
          logErrorToService(error, { componentStack: info.componentStack });
        }}
      >
        <Suspense fallback={<MetricSkeleton />}>
          <RevenueWidget />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<MetricSkeleton />}>
          <UsersWidget />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ChartSkeleton />}>
          <ErrorRateChart />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### `useErrorBoundary` — Programmatic Error Triggering

```jsx
// For errors in event handlers or async code (which Error Boundaries DON'T catch)
function DataExportButton({ reportId }) {
  const { showBoundary } = useErrorBoundary();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportReport(reportId);
      downloadBlob(blob, `report-${reportId}.csv`);
    } catch (error) {
      // Error Boundaries only catch errors during RENDER
      // Event handler errors are NOT caught automatically
      // showBoundary() manually triggers the nearest Error Boundary
      showBoundary(error);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
```

### What Error Boundaries DO and DON'T Catch

```
✅ CATCHES:                          ❌ DOES NOT CATCH:
─────────────────                    ─────────────────
Errors during render                 Event handlers (onClick, onChange)
Errors in lifecycle methods          Asynchronous code (setTimeout, fetch)
Errors in constructors               Server-side rendering
Errors in getDerivedStateFromError   Errors in the Error Boundary itself
```

### Real-World Use Case: Enterprise Dashboard Error Strategy

```jsx
// 3-tier error strategy for production dashboard
function EnterpriseDashboard() {
  return (
    // TIER 1: Page-level boundary — catches catastrophic failures
    <ErrorBoundary fallback={<FullPageError />}>
      <DashboardLayout>
        
        {/* TIER 2: Section-level — isolates major sections */}
        <ErrorBoundary fallback={<SectionError section="metrics" />}>
          <MetricsSection />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<SectionError section="charts" />}>
          <ChartsSection>
            
            {/* TIER 3: Widget-level — finest granularity */}
            <ErrorBoundary fallback={<WidgetError />}>
              <RevenueChart />
            </ErrorBoundary>
            <ErrorBoundary fallback={<WidgetError />}>
              <LatencyChart />
            </ErrorBoundary>
            
          </ChartsSection>
        </ErrorBoundary>
        
      </DashboardLayout>
    </ErrorBoundary>
  );
}

// If RevenueChart crashes:
// → WidgetError shows in that cell
// → LatencyChart still works
// → MetricsSection still works
// → Full page still works
// Only the broken widget shows an error
```


---

# 2. NEXT.JS 15

## 2.1 App Router Architecture — `HIGH PRIORITY`

### Theory: Why App Router Replaced Pages Router

The Pages Router (`pages/`) was built in 2016 when React was purely a client-side library. Every component ran on the client. Data fetching happened through `getServerSideProps` / `getStaticProps` — special Next.js functions that ran on the server but were SEPARATE from your components.

**Problems with Pages Router:**
1. **Data fetching lived outside components** — `getServerSideProps` had to fetch ALL data for a page at the top level, then drill it down through props. Colocating data fetching with components was impossible.
2. **Waterfall fetching** — child components couldn't start fetching until parent data arrived and rendered them
3. **All-or-nothing rendering** — entire page was either server-rendered or client-rendered
4. **Layout persistence** — navigating between pages re-mounted shared layouts (sidebar, header)
5. **No streaming** — had to wait for ALL data before sending ANY HTML

**App Router's solutions:**
- **Server Components** — components fetch their OWN data directly on the server
- **Nested layouts** — shared UI persists across navigations (no re-mount)
- **Streaming** — send HTML chunks as data becomes available
- **Parallel routes** — render multiple page sections simultaneously
- **Colocation** — loading.tsx, error.tsx, page.tsx live together per route

### File Conventions — What Each File Does

```
app/dashboard/
├── layout.tsx      → Wraps page + all child routes. Persists across navigations.
│                     State in layout SURVIVES when user navigates between child routes.
│                     Example: Sidebar open/closed state, scroll position.
│
├── page.tsx        → The actual page content. Unique per route.
│                     This is the only file that makes a route publicly accessible.
│
├── loading.tsx     → Instant loading UI. Auto-wrapped in <Suspense>.
│                     Shows while page.tsx's async data loads.
│                     User sees this within milliseconds of navigation — no blank screen.
│
├── error.tsx       → Error UI. Auto-wrapped in <ErrorBoundary>.
│                     Catches errors in page.tsx and all child components.
│                     Must be a Client Component ('use client') to offer retry.
│
├── not-found.tsx   → 404 UI for this route segment. Triggered by notFound().
│
├── template.tsx    → Like layout.tsx but RE-MOUNTS on every navigation.
│                     Use when you need fresh state per page (form resets, animations).
│
└── default.tsx     → Fallback for parallel routes when no matching segment exists.
```

### Real-World: Parallel Routes for Dashboard

```
app/dashboard/
├── layout.tsx              → Dashboard shell (sidebar + header)
├── @overview/
│   ├── page.tsx            → Overview panel (loads independently)
│   └── loading.tsx         → Overview skeleton
├── @analytics/
│   ├── page.tsx            → Analytics panel (loads independently)
│   └── loading.tsx         → Analytics skeleton
└── @notifications/
    ├── page.tsx            → Notifications panel
    └── loading.tsx         → Notifications skeleton
```

```jsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ overview, analytics, notifications }) {
  // Each @slot loads INDEPENDENTLY with its own loading state
  // If analytics takes 3 seconds, overview and notifications still show immediately
  return (
    <div className="grid grid-cols-[1fr_300px] gap-4">
      <div className="space-y-4">
        {overview}     {/* Shows its loading.tsx while fetching */}
        {analytics}    {/* Shows its loading.tsx independently */}
      </div>
      <aside>
        {notifications} {/* Loads on its own timeline */}
      </aside>
    </div>
  );
}
```

### Real-World: Intercepting Routes for Modals

```
app/
├── feed/
│   └── page.tsx                    → Feed with photo thumbnails
├── photo/[id]/
│   └── page.tsx                    → Full photo page (direct URL)
└── @modal/
    └── (..)photo/[id]/
        └── page.tsx                → Photo modal (intercepted from feed)
```

**How it works:** When user clicks a photo thumbnail in the feed, instead of navigating to `/photo/123`, Next.js **intercepts** the navigation and shows the photo in a modal overlay. The URL changes to `/photo/123` (shareable!), but the feed stays visible behind the modal. If user shares the URL or refreshes, they get the full photo page instead.

### Middleware — Deep Dive

```typescript
// middleware.ts — runs at the EDGE before any page/API route
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // EXAMPLE 1: Multi-tenant routing
  const hostname = request.headers.get('host');
  const tenant = hostname?.split('.')[0]; // acme.app.com → "acme"
  
  if (tenant && tenant !== 'www' && tenant !== 'app') {
    // Rewrite URL to include tenant context
    const url = request.nextUrl.clone();
    url.pathname = `/tenants/${tenant}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  // EXAMPLE 2: Auth check
  const token = request.cookies.get('session');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // EXAMPLE 3: A/B testing
  const bucket = request.cookies.get('ab-bucket');
  if (!bucket) {
    const response = NextResponse.next();
    response.cookies.set('ab-bucket', Math.random() > 0.5 ? 'A' : 'B');
    return response;
  }
  
  // EXAMPLE 4: Geo-based content
  const country = request.geo?.country || 'US';
  const response = NextResponse.next();
  response.headers.set('x-user-country', country);
  return response;
}

export const config = {
  // Only run middleware on these paths (performance optimization)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 2.2 Server vs Client Components — `HIGH PRIORITY`

### Theory: The Rendering Spectrum

Before React Server Components, there were only two options:
1. **Full CSR** — Everything renders in the browser (React SPA). Fast interactions but slow initial load.
2. **Full SSR** — Server renders HTML, then browser "hydrates" it. Fast initial load but ENTIRE component tree is sent as JS for hydration.

Server Components create a **third option** — components that render ONLY on the server and send ZERO JavaScript to the browser.

```
Component Type     | Where It Runs  | JS Sent to Browser | Can Use Hooks | Can Use Browser APIs
──────────────────-|───────────────-|───────────────────-|──────────────-|────────────────────
Server Component   | Server only    | 0 KB               | No            | No
Client Component   | Server + Client| Full component JS   | Yes           | Yes
```

### How Server Components Actually Work — Step by Step

```
1. Request hits Next.js server

2. Server renders the component tree:
   - Server Components: Execute on server, produce JSX
   - Client Components: Server renders their INITIAL HTML
     but marks them as "needs hydration"

3. Server produces RSC PAYLOAD (not HTML):
   This is a special streaming format:
   {
     type: "div",
     props: {
       children: [
         // Server Component result — fully rendered, no JS needed
         { type: "h1", props: { children: "Dashboard" } },
         
         // Client Component reference — needs JS on client
         { $$typeof: Symbol(client.reference), 
           name: "InteractiveChart",
           chunks: ["chart-abc123.js"] }  // JS chunk to load
       ]
     }
   }

4. Browser receives the payload:
   - Renders Server Component results immediately (no JS needed)
   - Downloads Client Component JS chunks
   - Hydrates Client Components (attaches event handlers)

5. Result:
   - Server Components: visible immediately, zero JS
   - Client Components: visible immediately, interactive after hydration
```

### The Composition Rule — Why It Works (and Why It Matters)

```jsx
// ✅ This works — Server Component passed as children to Client Component
// app/dashboard/page.tsx (Server Component — default)
import { ClientTabs } from './ClientTabs';
import { ServerData } from './ServerData';

export default async function DashboardPage() {
  const data = await fetchFromDB(); // Direct DB access on server
  
  return (
    <ClientTabs>
      {/* ServerData runs on server, produces HTML */}
      {/* Its output is SERIALIZED and sent to client as data */}
      <ServerData data={data} />
    </ClientTabs>
  );
}

// ClientTabs.tsx
'use client';
export function ClientTabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <button onClick={() => setActiveTab(0)}>Tab 1</button>
      <button onClick={() => setActiveTab(1)}>Tab 2</button>
      <div>{children}</div>  {/* Renders the server-produced HTML */}
    </div>
  );
}
```

**WHY this works internally:**

When the server renders `DashboardPage`:
1. `ServerData` executes on the server and produces JSX: `<div>Revenue: $1.8M</div>`
2. This JSX is serialized into the RSC payload as plain data (not a component)
3. `ClientTabs` receives this serialized data as its `children` prop
4. On the client, `ClientTabs` hydrates and renders `children` — which is just pre-rendered HTML
5. `ServerData` never runs on the client — its JS is never sent to the browser

**WHY direct import DOESN'T work:**

```jsx
'use client';
import { ServerData } from './ServerData'; // ❌ BREAKS

// When bundler sees this import inside a 'use client' file:
// It tries to INCLUDE ServerData in the CLIENT bundle
// But ServerData uses server-only features (DB, fs, etc.)
// → Build error or runtime crash
```

### Real-World Use Case: Product Page with Mixed Components

```jsx
// app/product/[id]/page.tsx — Server Component (default)
export default async function ProductPage({ params }) {
  // These run on the SERVER — direct database queries, no API calls needed
  const product = await db.products.findById(params.id);
  const relatedProducts = await db.products.findRelated(params.id);
  const reviews = await db.reviews.findByProduct(params.id);
  
  return (
    <div>
      {/* SERVER: Static product info — zero JS, instant render, SEO-friendly */}
      <ProductHeader product={product} />
      <ProductDescription description={product.description} />
      <ProductSpecs specs={product.specifications} />
      
      {/* CLIENT: Interactive elements — need hooks and event handlers */}
      <AddToCartButton product={product} />
      <ImageGallery images={product.images} />
      
      {/* SERVER: Reviews list — server-rendered, zero JS */}
      <ReviewsList reviews={reviews} />
      
      {/* CLIENT: Review form — needs useState for form management */}
      <WriteReviewForm productId={product.id} />
      
      {/* SERVER: Related products — zero JS */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}

// Result:
// Bundle size: Only AddToCartButton + ImageGallery + WriteReviewForm JS
// Everything else is HTML-only — no JavaScript shipped
// For a typical product page: 60-70% LESS client JS
```

---

## 2.3 Caching in Next.js 15 — `HIGH PRIORITY` (BREAKING CHANGES)

### Theory: Why 4 Layers of Cache?

Each layer solves a different problem at a different scope:

```
Layer 1: REQUEST MEMOIZATION
─────────────────────────────
Problem: Multiple Server Components in the same render need the same data
         Without dedup, fetching user data in Header AND Sidebar = 2 identical requests

How: React automatically deduplicates fetch() calls with same URL + options
     within a SINGLE server render pass

Scope: One render → expires when response is sent to browser
No configuration needed — it's automatic

Example:
  // Both components call the same API — only 1 request fires
  async function Header() {
    const user = await fetch('/api/user'); // REQUEST #1
    return <h1>Welcome, {user.name}</h1>;
  }
  async function Sidebar() {
    const user = await fetch('/api/user'); // DEDUPLICATED — uses result of #1
    return <nav>Menu for {user.role}</nav>;
  }


Layer 2: DATA CACHE (server-side, persistent)
─────────────────────────────
Problem: Same data fetched across DIFFERENT requests (different users visiting same page)
         Without cache, every visitor triggers a fresh API/DB call

⚠️ NEXT.JS 15 CHANGE: Now OPT-IN (was opt-out in 14)

How: Next.js caches fetch() responses on the server between requests
     Must explicitly opt in:
     
  // Opt in to data caching:
  fetch(url, { cache: 'force-cache' })               // Cache indefinitely
  fetch(url, { next: { revalidate: 3600 } })          // Cache for 1 hour
  fetch(url, { next: { tags: ['products'] } })        // Cache with tag for invalidation

  // Default in Next.js 15 (NO cache):
  fetch(url)                                           // Fresh every request
  fetch(url, { cache: 'no-store' })                    // Explicit no-cache


Layer 3: FULL ROUTE CACHE (build time + persistent)
─────────────────────────────
Problem: Static pages (blog posts, marketing pages) don't need to render per-request
         Why re-render the same HTML for every visitor?

How: Next.js pre-renders ENTIRE route HTML + RSC payload at build time
     Serves cached HTML directly — no server rendering needed

When it applies: Routes with NO dynamic functions
  Dynamic functions that OPT OUT: cookies(), headers(), searchParams, 
  connection(), draftMode(), unstable_noStore()

When it breaks: If ANY component in the route uses a dynamic function,
  the ENTIRE route becomes dynamic (no full route cache)


Layer 4: ROUTER CACHE (client-side, in-memory)
─────────────────────────────
Problem: Navigating back to previously visited pages causes a full round-trip
         User clicks "Dashboard" → visits "Settings" → clicks "Dashboard" again
         Without client cache: second "Dashboard" visit = new server request

How: Browser caches RSC payloads for visited routes in memory
     Back/forward navigation is instant

Duration: 
  Static routes: 5 minutes
  Dynamic routes: 30 seconds (configurable)
  
Invalidate:
  router.refresh()         // Force re-fetch current route
  revalidatePath('/path')  // Server-side invalidation (Server Actions)
```

### Real-World Use Case: E-Commerce Product Catalog

```typescript
// SCENARIO: Product catalog with 10,000 products
// Different caching strategy for each data type

// 1. Product list page — cache for 1 hour, revalidate when admin updates
async function ProductListPage({ searchParams }) {
  const products = await fetch('https://api.store.com/products', {
    next: { 
      revalidate: 3600,           // Revalidate every hour
      tags: ['product-list'],      // Can manually invalidate
    },
  }).then(res => res.json());
  
  return <ProductGrid products={products} />;
}

// 2. Individual product — cache indefinitely, invalidate on edit
async function ProductPage({ params }) {
  const product = await fetch(`https://api.store.com/products/${params.id}`, {
    next: { tags: [`product-${params.id}`] },  // Tag-based invalidation
  }).then(res => res.json());
  
  // Price and stock — never cache (changes frequently)
  const pricing = await fetch(`https://api.store.com/pricing/${params.id}`, {
    cache: 'no-store',  // Always fresh
  }).then(res => res.json());
  
  return <ProductDetail product={product} pricing={pricing} />;
}

// 3. Server Action to invalidate after admin edits a product
'use server';
async function updateProduct(id, data) {
  await db.products.update(id, data);
  
  revalidateTag(`product-${id}`);   // Invalidate this product's cache
  revalidateTag('product-list');     // Invalidate the list page too
}
```

---

## 2.4 Server Actions & Data Mutations — `MEDIUM PRIORITY`

### Theory: What Problem Do Server Actions Solve?

Before Server Actions, mutating data in Next.js required:
1. Create an API route (`pages/api/create-post.ts`)
2. Write the handler function
3. In the component, `fetch('/api/create-post', { method: 'POST', body: ... })`
4. Handle loading/error/success states
5. Invalidate caches manually
6. Handle revalidation

**That's 6 steps for a simple form submission.** Server Actions collapse it into 1:

```jsx
// Server Action — ONE file, ZERO API routes
'use server';

export async function createPost(formData: FormData) {
  // This function runs on the SERVER
  // It has direct access to databases, file systems, secrets
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  // Validation
  const parsed = PostSchema.safeParse({ title, content });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  
  // Database mutation
  await db.posts.create({
    title: parsed.data.title,
    content: parsed.data.content,
    authorId: await getSessionUserId(),
  });
  
  // Cache invalidation
  revalidatePath('/blog');
  
  // Redirect
  redirect('/blog');
}
```

### Progressive Enhancement — The Killer Feature

```jsx
// This form works EVEN WITH JAVASCRIPT DISABLED
// The <form> element's action attribute handles submission natively
function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Publish</button>
    </form>
  );
}
// Without JS: HTML form submission → server processes → redirect to /blog
// With JS: React intercepts → shows pending state → server processes → updates UI
```

### With Client-Side Enhancements

```jsx
'use client';
import { useActionState } from 'react';
import { createPost } from './actions';

function NewPostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  
  return (
    <form action={formAction}>
      <input name="title" required disabled={isPending} />
      {state?.error?.title && <p className="text-red-500">{state.error.title}</p>}
      
      <textarea name="content" required disabled={isPending} />
      {state?.error?.content && <p className="text-red-500">{state.error.content}</p>}
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Publishing...' : 'Publish'}
      </button>
    </form>
  );
}
```

### Real-World Use Case: Dashboard CRUD with Optimistic Updates

```jsx
'use server';
export async function toggleApiStatus(apiId: string, enabled: boolean) {
  await db.apis.update(apiId, { enabled });
  revalidateTag('api-list');
  return { success: true };
}

// Client Component
'use client';
function ApiToggle({ api }) {
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(api.enabled);
  
  async function handleToggle() {
    setOptimisticEnabled(!optimisticEnabled); // Instant UI feedback
    await toggleApiStatus(api.id, !api.enabled); // Server Action
    // If server fails → optimistic state auto-reverts
  }
  
  return (
    <Switch
      checked={optimisticEnabled}
      onChange={handleToggle}
      label={optimisticEnabled ? 'Active' : 'Inactive'}
    />
  );
}
```

---

## 2.5 SSR / SSG / ISR — `HIGH PRIORITY`

### Theory: The Rendering Decision Tree

```
Does this page need to be different for each user?
│
├── NO: Is the content static forever?
│   ├── YES → SSG (Static Site Generation)
│   │         Build once. Serve from CDN. Fastest possible.
│   │         Examples: Blog posts, docs, marketing pages
│   │
│   └── NO: How often does content change?
│       ├── Every few minutes/hours → ISR (Incremental Static Regeneration)
│       │   Serve cached page, regenerate in background.
│       │   Examples: Product pages, news articles, pricing pages
│       │
│       └── Needs real-time accuracy → SSR (Server-Side Rendering)
│           Render fresh on every request.
│           Examples: Stock prices, live scores, real-time dashboards
│
├── YES → Does it need SEO?
│   ├── YES → Streaming SSR with Suspense
│   │         Send shell fast, stream dynamic content.
│   │         Examples: Personalized landing pages, search results
│   │
│   └── NO → CSR (Client-Side Rendering)
│           Render entirely in browser.
│           Examples: Admin dashboards, internal tools, authenticated apps
│
└── MIXED → Partial Prerendering (PPR)
            Static shell + dynamic holes. Best of all worlds.
            Examples: E-commerce product page (static info + dynamic price/stock)
```

### SSG — Static Site Generation

```jsx
// app/blog/[slug]/page.tsx

// Tell Next.js which pages to pre-build
export async function generateStaticParams() {
  const posts = await db.posts.findAll();
  return posts.map(post => ({ slug: post.slug }));
  // Next.js builds /blog/react-19, /blog/nextjs-15, etc. at BUILD time
}

// This runs ONCE at build time, result is cached forever
export default async function BlogPost({ params }) {
  const post = await db.posts.findBySlug(params.slug);
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
    </article>
  );
}

// Result: HTML files served directly from CDN
// Time to first byte: ~10ms (CDN edge)
// Perfect for SEO, perfect for performance
```

### ISR — Incremental Static Regeneration

```jsx
// app/products/[id]/page.tsx
export const revalidate = 3600; // Regenerate every 1 hour

export default async function ProductPage({ params }) {
  const product = await fetch(`https://api.store.com/products/${params.id}`, {
    next: { revalidate: 3600 },
  }).then(res => res.json());
  
  return <ProductDetail product={product} />;
}

// Timeline:
// Build time: page.html generated with product data
// t=0 to t=3600: Every visitor gets the cached HTML (instant, CDN-served)
// t=3601: First visitor after 3600s gets STALE page (still fast)
//         In background: Next.js regenerates the page with fresh data
// t=3602: Next visitor gets the FRESH page
// Repeat
```

### Partial Prerendering (PPR) — The Future

```jsx
// app/product/[id]/page.tsx
export const experimental_ppr = true;

export default async function ProductPage({ params }) {
  return (
    <div>
      {/* STATIC SHELL — pre-rendered at build time */}
      <Header />
      <ProductImages productId={params.id} />
      <ProductDescription productId={params.id} />
      
      {/* DYNAMIC HOLES — streamed at request time */}
      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPrice productId={params.id} />  {/* Needs real-time price */}
      </Suspense>
      
      <Suspense fallback={<StockSkeleton />}>
        <StockStatus productId={params.id} />   {/* Needs real-time stock */}
      </Suspense>
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <PersonalizedReviews userId={getUserId()} /> {/* User-specific */}
      </Suspense>
      
      {/* STATIC — pre-rendered */}
      <Footer />
    </div>
  );
}

// Result:
// Initial response: Pre-built HTML shell with skeleton placeholders (~10ms TTFB)
// Streaming: Price, stock, reviews stream in as their data becomes available
// Best of both worlds: CDN-speed initial load + real-time dynamic content
```

---

## 2.6 Image & Font Optimization — `MEDIUM PRIORITY`

```jsx
import Image from 'next/image';
import { Inter } from 'next/font/google';

// Font: self-hosted, zero CLS
const inter = Inter({ subsets: ['latin'] });

// Image: auto WebP/AVIF, lazy loading, responsive
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority          // LCP image — don't lazy load
  placeholder="blur" // Show blur while loading
  blurDataURL="data:image/..."
  sizes="(max-width: 768px) 100vw, 50vw"  // Responsive
/>

// Fill mode for unknown dimensions
<div style={{ position: 'relative', width: '100%', height: 400 }}>
  <Image src="/bg.jpg" alt="Background" fill style={{ objectFit: 'cover' }} />
</div>
```

---

# 3. TYPESCRIPT ADVANCED

## 3.1 Advanced Types — `HIGH PRIORITY`

### Generics with Constraints

```typescript
// Basic generic
function identity<T>(value: T): T {
  return value;
}

// Constrained generic — T must have a 'length' property
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
getLength("hello");     // ✅ string has length
getLength([1, 2, 3]);   // ✅ array has length
getLength(42);           // ❌ number has no length

// Generic with keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Dharma", age: 28 };
getProperty(user, "name"); // ✅ returns string
getProperty(user, "foo");  // ❌ "foo" is not in keyof user
```

### Conditional Types

```typescript
// Basic: T extends U ? X : Y
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"

// The `infer` keyword — extracts types from other types
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
type Fn = () => string;
type Result = ReturnTypeOf<Fn>; // string

// Unwrap Promise
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type A = Unwrap<Promise<string>>; // string
type B = Unwrap<number>;          // number

// Extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;
type Item = ElementOf<string[]>; // string
```

### Mapped Types

```typescript
// Make all properties optional
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Transform property types
type Stringify<T> = {
  [K in keyof T]: string;
};

// Key remapping (TypeScript 4.1+)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

### Template Literal Types

```typescript
type EventName = `on${Capitalize<'click' | 'focus' | 'blur'>}`;
// "onClick" | "onFocus" | "onBlur"

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIRoute = `/api/${string}`;
type Endpoint = `${HTTPMethod} ${APIRoute}`;
// "GET /api/..." | "POST /api/..." | ...
```

### Distributive Conditional Types

```typescript
// When T is a union, the conditional distributes over each member
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;
// string[] | number[] — NOT (string | number)[]

// To prevent distribution, wrap in tuple
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type Result2 = ToArrayNonDistributive<string | number>;
// (string | number)[]
```

---

## 3.2 Discriminated Unions — `HIGH PRIORITY`

This is the **single most useful TypeScript pattern** for frontend state management.

```typescript
// API State Machine
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Usage with exhaustive switch
function renderState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return <p>Ready to search</p>;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <DataView data={state.data} />; // TypeScript KNOWS data exists here
    case 'error':
      return <ErrorMessage error={state.error} />; // TypeScript KNOWS error exists here
    default:
      const _exhaustive: never = state; // ❌ Compile error if you miss a case
      return _exhaustive;
  }
}
```

**Why `never` in default works:** If all union members are handled, the `default` case can never be reached. TypeScript narrows the type to `never`. If you add a new status without handling it, TypeScript throws a compile error because it can't assign the new status to `never`.

### Real-World: Form Actions

```typescript
type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'VALIDATE'; field: string }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; data: Response }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }; // field & value available
    case 'SUBMIT_SUCCESS':
      return { ...state, data: action.data, submitting: false }; // data available
    // ... TypeScript enforces handling every case
  }
}
```

---

## 3.3 Utility Types — `HIGH PRIORITY`

### The Essential Utility Types

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Partial<T> — all properties optional
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; ... }

// Required<T> — all properties required
type StrictUser = Required<Partial<User>>;

// Readonly<T> — all properties readonly
type FrozenUser = Readonly<User>;

// Pick<T, K> — select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit<T, K> — remove specific properties
type UserInput = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; role: 'admin' | 'user' }

// Record<K, V> — object type with specific key/value types
type UserMap = Record<string, User>;
// { [key: string]: User }
type RolePermissions = Record<User['role'], string[]>;
// { admin: string[]; user: string[] }

// ReturnType<T> — extract function return type
function fetchUser() { return { name: "Dharma", age: 28 }; }
type UserData = ReturnType<typeof fetchUser>;
// { name: string; age: number }

// Parameters<T> — extract function parameter types
type FetchParams = Parameters<typeof fetch>;
// [input: RequestInfo | URL, init?: RequestInit]

// Awaited<T> — unwrap Promise type
type ResolvedUser = Awaited<ReturnType<typeof fetchUser>>;

// NonNullable<T> — remove null and undefined
type Name = string | null | undefined;
type StrictName = NonNullable<Name>; // string

// Extract<T, U> / Exclude<T, U>
type AdminRole = Extract<'admin' | 'user' | 'guest', 'admin' | 'user'>;
// 'admin' | 'user'
type NonAdmin = Exclude<'admin' | 'user' | 'guest', 'admin'>;
// 'user' | 'guest'
```

---

## 3.4 Type Guards & Narrowing — `MEDIUM PRIORITY`

```typescript
// Built-in narrowing
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase(); // TypeScript knows it's string here
  } else {
    value.toFixed(2);    // TypeScript knows it's number here
  }
}

// Custom type guard — the `is` keyword
interface Dog { bark(): void; breed: string; }
interface Cat { purr(): void; color: string; }

function isDog(animal: Dog | Cat): animal is Dog {
  return 'bark' in animal;
}

function handleAnimal(animal: Dog | Cat) {
  if (isDog(animal)) {
    animal.bark();   // TypeScript knows it's Dog
    animal.breed;    // ✅ accessible
  } else {
    animal.purr();   // TypeScript knows it's Cat
  }
}

// Assertion function — throws if condition fails
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function processInput(input: unknown) {
  assertIsString(input);
  input.toUpperCase(); // TypeScript knows it's string after assertion
}
```

---

## 3.5 Zod & Runtime Validation — `MEDIUM PRIORITY`

TypeScript types are erased at runtime. **Zod** adds runtime validation with auto-generated types.

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  age: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Auto-generate TypeScript type from schema
type User = z.infer<typeof UserSchema>;
// { id: number; name: string; email: string; role: 'admin' | 'user' | 'guest'; ... }

// parse() — throws ZodError on failure
try {
  const user = UserSchema.parse(apiResponse);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log(e.errors); // Detailed error messages
  }
}

// safeParse() — returns result object (no throw)
const result = UserSchema.safeParse(apiResponse);
if (result.success) {
  console.log(result.data); // Typed as User
} else {
  console.log(result.error.issues); // Validation errors
}

// Transformations
const StringToNumber = z.string().transform(val => parseInt(val, 10));

// Integration with React Hook Form
import { zodResolver } from '@hookform/resolvers/zod';
const { register, handleSubmit } = useForm<User>({
  resolver: zodResolver(UserSchema),
});
```

---

## 3.6 TypeScript in Practice — Theory & Real-World Use Cases

### Theory: Why Advanced TypeScript Matters for Senior Engineers

At 6 years of experience, interviewers expect you to go beyond basic typing. They want to see:
1. **Generics** — building reusable, type-safe abstractions
2. **Type manipulation** — deriving types from other types (DRY principle)
3. **Type-safe state machines** — discriminated unions for complex UI state
4. **Runtime safety** — Zod for API boundary validation

### Real-World Use Case: Type-Safe API Client with Generics

```typescript
// Generic API client that provides type safety for ALL endpoints
interface APIEndpoints {
  '/api/users': { response: User[]; params: { role?: string } };
  '/api/users/:id': { response: User; params: { id: string } };
  '/api/posts': { response: Post[]; params: { page?: number } };
}

// Generic fetch function that infers types from endpoint
async function api<T extends keyof APIEndpoints>(
  endpoint: T,
  options?: { params?: APIEndpoints[T]['params'] }
): Promise<APIEndpoints[T]['response']> {
  const url = buildURL(endpoint, options?.params);
  const res = await fetch(url);
  return res.json();
}

// Usage — fully type-safe
const users = await api('/api/users', { params: { role: 'admin' } });
// TypeScript knows: users is User[]

const user = await api('/api/users/:id', { params: { id: '123' } });
// TypeScript knows: user is User

const posts = await api('/api/posts');
// TypeScript knows: posts is Post[]

await api('/api/unknown'); // ❌ TypeScript error — endpoint doesn't exist
```

### Real-World Use Case: Discriminated Unions for Complex Form State

```typescript
// Instead of a bag of booleans that can be in impossible states:
// ❌ BAD: loading=true AND error="failed" AND data=[...] → impossible but allowed
type BadState = {
  loading: boolean;
  error: string | null;
  data: User[] | null;
};

// ✅ GOOD: Discriminated union — only valid states are possible
type FormState =
  | { status: 'idle' }
  | { status: 'validating'; field: string }
  | { status: 'submitting'; data: FormData }
  | { status: 'success'; response: APIResponse; redirectUrl: string }
  | { status: 'error'; errors: Record<string, string[]>; retryCount: number }
  | { status: 'rate_limited'; retryAfter: number };

function FormStatusBanner({ state }: { state: FormState }) {
  switch (state.status) {
    case 'idle':
      return null;
    case 'validating':
      return <p>Checking {state.field}...</p>;
    case 'submitting':
      return <p>Submitting...</p>;
    case 'success':
      return <p>Success! Redirecting to {state.redirectUrl}...</p>;
    case 'error':
      return (
        <div>
          {Object.entries(state.errors).map(([field, msgs]) => (
            <p key={field}>{field}: {msgs.join(', ')}</p>
          ))}
          <p>Retry attempt: {state.retryCount}</p>
        </div>
      );
    case 'rate_limited':
      return <p>Too many attempts. Try again in {state.retryAfter}s</p>;
    default:
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

### Real-World Use Case: Zod for API Boundary Validation

```typescript
// SCENARIO: Your frontend receives data from 3 different APIs
// TypeScript types are erased at runtime — you ASSUME the shape is correct
// If the backend changes a field name or type, your app crashes at runtime

// Zod adds RUNTIME validation at the API boundary
const APIResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'viewer']),
    lastLogin: z.string().datetime().transform(s => new Date(s)),
    metadata: z.record(z.unknown()).optional(),
  })),
  pagination: z.object({
    page: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean(),
  }),
});

type APIResponse = z.infer<typeof APIResponseSchema>;

// In your API client:
async function fetchUsers(): Promise<APIResponse> {
  const res = await fetch('/api/users');
  const json = await res.json();
  
  // This CATCHES backend changes at the API boundary
  // Instead of crashing deep in a component with "Cannot read property of undefined"
  const parsed = APIResponseSchema.safeParse(json);
  
  if (!parsed.success) {
    // Log the mismatch — helps debug API contract changes
    console.error('API response mismatch:', parsed.error.flatten());
    throw new APIContractError('Users API returned unexpected shape', parsed.error);
  }
  
  return parsed.data; // Fully typed AND validated
}
```

---

### Theory: The Evolution of React State Management

```
2015: Redux — centralized store for EVERYTHING
      Problem: 500-line reducers, actions, action types for one feature
      
2019: React hooks — useState/useReducer for local state
      Problem: "Where does shared state go?"
      
2020: Redux Toolkit — simplified Redux (less boilerplate)
      Problem: Still overkill for most state, RTK Query added for server state
      
2021: Zustand — minimal global state (~2KB, no Provider)
      Problem: Still mixing server and client state
      
2022: TanStack Query — dedicated server state management
      Insight: 80% of Redux was caching server data — that's not "state management"
      
2024: State Classification Framework — 4 buckets
      Senior engineer realization: "Different types of state need different tools"
```

### Real-World: Redux Toolkit in a Large Enterprise App

```typescript
// WHEN Redux still makes sense:
// 1. Large team (10+ devs) — Redux's strict patterns prevent chaos
// 2. Complex state transitions — middleware, saga, listener pattern
// 3. Time-travel debugging — critical for reproducing user-reported bugs
// 4. Already invested — 500+ files using Redux — migration isn't free

// RTK Query — the most underrated feature of Redux Toolkit
const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Metrics', 'Alerts', 'Clients'],
  endpoints: (builder) => ({
    // GET endpoint with polling
    getMetrics: builder.query({
      query: (clientId) => `/metrics/${clientId}`,
      providesTags: ['Metrics'],
      pollingInterval: 30000,  // Auto-refetch every 30s
    }),
    
    // Mutation with optimistic update
    acknowledgeAlert: builder.mutation({
      query: (alertId) => ({
        url: `/alerts/${alertId}/acknowledge`,
        method: 'POST',
      }),
      // Optimistic update — instant UI feedback
      async onQueryStarted(alertId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          dashboardApi.util.updateQueryData('getAlerts', undefined, (draft) => {
            const alert = draft.find(a => a.id === alertId);
            if (alert) alert.acknowledged = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Revert on server failure
        }
      },
      invalidatesTags: ['Alerts'],
    }),
  }),
});
```

### Real-World: Zustand for Lean Global State

```typescript
// WHEN Zustand wins:
// 1. New project — start lean, add complexity only when needed
// 2. Simple global state — theme, auth status, sidebar state
// 3. Performance-sensitive — 2KB vs 43KB bundle
// 4. TypeScript-first — Zustand's type inference is excellent
// 5. Combined with TanStack Query — Zustand handles UI state, TQ handles server state

// Real dashboard store with Zustand
interface DashboardStore {
  // UI State
  sidebarOpen: boolean;
  activeTab: 'overview' | 'analytics' | 'settings';
  selectedClientId: string | null;
  dateRange: { start: Date; end: Date };
  
  // Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: DashboardStore['activeTab']) => void;
  selectClient: (id: string | null) => void;
  setDateRange: (range: DashboardStore['dateRange']) => void;
}

const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        activeTab: 'overview',
        selectedClientId: null,
        dateRange: { start: subDays(new Date(), 7), end: new Date() },
        
        toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
        setActiveTab: (tab) => set({ activeTab: tab }),
        selectClient: (id) => set({ selectedClientId: id }),
        setDateRange: (range) => set({ dateRange: range }),
      }),
      { name: 'dashboard-store', partialize: (s) => ({ sidebarOpen: s.sidebarOpen }) }
    ),
    { name: 'Dashboard' }
  )
);

// Components subscribe to ONLY what they need — surgical re-renders
function Sidebar() {
  const isOpen = useDashboardStore(s => s.sidebarOpen);  // Only re-renders when sidebar changes
  const toggle = useDashboardStore(s => s.toggleSidebar);
  // Does NOT re-render when activeTab or dateRange changes
}
```

### Real-World: TanStack Query for Server State

```typescript
// SCENARIO: Dashboard that fetches from 5 different APIs
// WITH TanStack Query — each widget manages its own server state

function RevenueWidget({ clientId, dateRange }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['revenue', clientId, dateRange],
    queryFn: () => fetchRevenue(clientId, dateRange),
    staleTime: 5 * 60 * 1000,     // Consider fresh for 5 min
    gcTime: 30 * 60 * 1000,       // Keep in cache 30 min after unmount
    refetchOnWindowFocus: true,     // Refetch when tab regains focus
    retry: 3,                       // Retry 3 times on failure
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    
    // Placeholder data while real data loads
    placeholderData: (previousData) => previousData, // Show old data while new loads
  });

  if (isLoading) return <MetricSkeleton />;
  if (isError) return <WidgetError error={error} onRetry={refetch} />;
  
  return (
    <div>
      <h3>Revenue</h3>
      <p className="text-3xl">${data.total.toLocaleString()}</p>
    </div>
  );
}

// The MAGIC: Change clientId or dateRange:
// 1. Previous data stays visible (placeholderData)
// 2. New data fetches in background
// 3. When ready, UI updates with new data
// 4. No loading spinner — smooth transition
// 5. If user switches back to previous client, data is CACHED — instant
```


---

# 4. STATE MANAGEMENT

## 4.1 Redux Toolkit (RTK) — `HIGH PRIORITY`

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    posts: postsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getUsers();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    // Immer-powered immutable updates (write mutating code, Immer handles immutability)
    userAdded(state, action) {
      state.items.push(action.payload); // ✅ Looks like mutation, but Immer makes it immutable
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});
```

### RTK Query

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Users', 'Posts'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['Users'], // Auto-refetches getUsers
    }),
  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = apiSlice;
```

---

## 4.2 Zustand — `HIGH PRIORITY`

```typescript
import { create } from 'zustand';
import { devtools, persist, immer } from 'zustand/middleware';

interface Store {
  users: User[];
  selectedId: string | null;
  addUser: (user: User) => void;
  selectUser: (id: string) => void;
}

const useStore = create<Store>()(
  devtools(
    persist(
      immer((set) => ({
        users: [],
        selectedId: null,
        addUser: (user) => set((state) => { state.users.push(user); }), // Immer mutation
        selectUser: (id) => set({ selectedId: id }),
      })),
      { name: 'app-store' } // localStorage key
    )
  )
);

// Usage — select ONLY what you need (performance)
const users = useStore((state) => state.users);
const addUser = useStore((state) => state.addUser);
// Component only re-renders when `users` changes, not when `selectedId` changes
```

### Redux Toolkit vs Zustand — The Comparison

| Feature | Redux Toolkit | Zustand |
|---------|--------------|---------|
| **Bundle size** | ~43KB | ~2KB |
| **Boilerplate** | Medium (slices, store config) | Minimal (single `create` call) |
| **Provider needed** | Yes (`<Provider store={store}>`) | No (hook-based, no wrapper) |
| **DevTools** | Excellent (time-travel) | Good (via middleware) |
| **TypeScript DX** | More boilerplate for types | Better type inference |
| **Best for** | Large teams, complex state, enterprise | Small-medium apps, simpler state |
| **RTK Query** | Built-in data fetching | Use with TanStack Query |
| **Middleware** | Thunks, listeners, RTK Query | persist, devtools, immer |
| **Learning curve** | Steeper | Very low |

**When to choose which:**
- **Redux Toolkit:** Large teams, need time-travel debugging, already using Redux, complex middleware requirements
- **Zustand:** New projects, simpler global state, want minimal boilerplate, using TanStack Query for server state

---

## 4.3 TanStack Query (React Query) — `HIGH PRIORITY`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching
function UserProfile({ userId }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],       // Cache key (auto-refetches when userId changes)
    queryFn: () => fetchUser(userId),  // Fetch function
    staleTime: 5 * 60 * 1000,         // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000,           // Keep in cache for 30 minutes after unmount
    retry: 3,                          // Retry failed requests 3 times
    refetchOnWindowFocus: true,        // Refetch when tab regains focus
  });
}

// Mutations with optimistic update
function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updatedUser) => api.updateUser(updatedUser),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', newData.id] });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['user', newData.id]);
      
      // Optimistically update
      queryClient.setQueryData(['user', newData.id], newData);
      
      return { previousUser }; // Context for rollback
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', newData.id], context.previousUser);
    },
    onSettled: () => {
      // Refetch to ensure server state is accurate
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Infinite scroll
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
```

### `staleTime` vs `gcTime` (formerly `cacheTime`)

| Property | What It Does | Default |
|----------|-------------|---------|
| `staleTime` | How long data is considered **fresh** (no refetch) | 0 (always stale) |
| `gcTime` | How long **unused** data stays in memory cache | 5 min |

- `staleTime: 0` → Refetches on every mount/window focus (but shows cached data instantly)
- `staleTime: Infinity` → Never auto-refetches (manual only)
- `gcTime: 0` → Remove from cache immediately when component unmounts

---

## 4.4 State Classification Framework — `HIGH PRIORITY`

**This is THE senior answer.** It shows architectural thinking, not just library knowledge.

```
┌─────────────────────────────────────────────────────────┐
│               4 BUCKETS OF STATE                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. SERVER STATE (async, cached, shared)                │
│     → TanStack Query / RTK Query                        │
│     → API responses, database data                      │
│     → Stale-while-revalidate caching                    │
│                                                         │
│  2. GLOBAL CLIENT STATE (synchronous, app-wide)         │
│     → Zustand / Redux Toolkit                           │
│     → Auth status, theme, sidebar open/closed           │
│     → Rarely changes, needs to be everywhere            │
│                                                         │
│  3. LOCAL UI STATE (component-scoped)                   │
│     → useState / useReducer                             │
│     → Form inputs, modal open, accordion expanded       │
│     → Does NOT belong in global store                   │
│                                                         │
│  4. URL STATE (shareable, bookmarkable)                 │
│     → useSearchParams / nuqs                            │
│     → Filters, pagination, sort order, tab selection    │
│     → Should survive page refresh and sharing           │
│                                                         │
└─────────────────────────────────────────────────────────┘

GOLDEN RULE: Never put server data in a global store.
Use TanStack Query for server state. It handles caching,
refetching, optimistic updates, and background sync.
```

---

## 4.5 State Management in Practice — Theory & Real-World Use Cases

### Theory: The Evolution of React State Management

```
2015: Redux — centralized store for EVERYTHING
      Problem: 500-line reducers, actions, action types for one feature
      
2019: React hooks — useState/useReducer for local state
      Problem: "Where does shared state go?"
      
2020: Redux Toolkit — simplified Redux (less boilerplate)
      Problem: Still overkill for most state, RTK Query added for server state
      
2021: Zustand — minimal global state (~2KB, no Provider)
      Problem: Still mixing server and client state
      
2022: TanStack Query — dedicated server state management
      Insight: 80% of Redux was caching server data — that's not "state management"
      
2024: State Classification Framework — 4 buckets
      Senior engineer realization: "Different types of state need different tools"
```

### Real-World: Redux Toolkit in a Large Enterprise App

```typescript
// WHEN Redux still makes sense:
// 1. Large team (10+ devs) — Redux's strict patterns prevent chaos
// 2. Complex state transitions — middleware, saga, listener pattern
// 3. Time-travel debugging — critical for reproducing user-reported bugs
// 4. Already invested — 500+ files using Redux — migration isn't free

// RTK Query — the most underrated feature of Redux Toolkit
const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Metrics', 'Alerts', 'Clients'],
  endpoints: (builder) => ({
    // GET endpoint with polling
    getMetrics: builder.query({
      query: (clientId) => `/metrics/${clientId}`,
      providesTags: ['Metrics'],
      pollingInterval: 30000,  // Auto-refetch every 30s
    }),
    
    // Mutation with optimistic update
    acknowledgeAlert: builder.mutation({
      query: (alertId) => ({
        url: `/alerts/${alertId}/acknowledge`,
        method: 'POST',
      }),
      // Optimistic update — instant UI feedback
      async onQueryStarted(alertId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          dashboardApi.util.updateQueryData('getAlerts', undefined, (draft) => {
            const alert = draft.find(a => a.id === alertId);
            if (alert) alert.acknowledged = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Revert on server failure
        }
      },
      invalidatesTags: ['Alerts'],
    }),
  }),
});
```

### Real-World: Zustand for Lean Global State

```typescript
// WHEN Zustand wins:
// 1. New project — start lean, add complexity only when needed
// 2. Simple global state — theme, auth status, sidebar state
// 3. Performance-sensitive — 2KB vs 43KB bundle
// 4. TypeScript-first — Zustand's type inference is excellent
// 5. Combined with TanStack Query — Zustand handles UI state, TQ handles server state

// Real dashboard store with Zustand
interface DashboardStore {
  // UI State
  sidebarOpen: boolean;
  activeTab: 'overview' | 'analytics' | 'settings';
  selectedClientId: string | null;
  dateRange: { start: Date; end: Date };
  
  // Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: DashboardStore['activeTab']) => void;
  selectClient: (id: string | null) => void;
  setDateRange: (range: DashboardStore['dateRange']) => void;
}

const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        activeTab: 'overview',
        selectedClientId: null,
        dateRange: { start: subDays(new Date(), 7), end: new Date() },
        
        toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
        setActiveTab: (tab) => set({ activeTab: tab }),
        selectClient: (id) => set({ selectedClientId: id }),
        setDateRange: (range) => set({ dateRange: range }),
      }),
      { name: 'dashboard-store', partialize: (s) => ({ sidebarOpen: s.sidebarOpen }) }
    ),
    { name: 'Dashboard' }
  )
);

// Components subscribe to ONLY what they need — surgical re-renders
function Sidebar() {
  const isOpen = useDashboardStore(s => s.sidebarOpen);  // Only re-renders when sidebar changes
  const toggle = useDashboardStore(s => s.toggleSidebar);
  // Does NOT re-render when activeTab or dateRange changes
}
```

### Real-World: TanStack Query for Server State

```typescript
// SCENARIO: Dashboard that fetches from 5 different APIs
// WITH TanStack Query — each widget manages its own server state

function RevenueWidget({ clientId, dateRange }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['revenue', clientId, dateRange],
    queryFn: () => fetchRevenue(clientId, dateRange),
    staleTime: 5 * 60 * 1000,     // Consider fresh for 5 min
    gcTime: 30 * 60 * 1000,       // Keep in cache 30 min after unmount
    refetchOnWindowFocus: true,     // Refetch when tab regains focus
    retry: 3,                       // Retry 3 times on failure
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    
    // Placeholder data while real data loads
    placeholderData: (previousData) => previousData, // Show old data while new loads
  });

  if (isLoading) return <MetricSkeleton />;
  if (isError) return <WidgetError error={error} onRetry={refetch} />;
  
  return (
    <div>
      <h3>Revenue</h3>
      <p className="text-3xl">${data.total.toLocaleString()}</p>
    </div>
  );
}

// The MAGIC: Change clientId or dateRange:
// 1. Previous data stays visible (placeholderData)
// 2. New data fetches in background
// 3. When ready, UI updates with new data
// 4. No loading spinner — smooth transition
// 5. If user switches back to previous client, data is CACHED — instant
```


---

# 5. PERFORMANCE

## 5.1 Core Web Vitals — `HIGH PRIORITY`

### Theory: Why Google Cares About Web Performance

In 2021, Google made Core Web Vitals a **ranking factor** in search results. This means slow websites get penalized in Google Search — directly impacting traffic and revenue. For a company like TartanHQ serving HDFC Bank, slow dashboards mean enterprise clients leave.

### INP — The Metric Most Developers Don't Know

**INP (Interaction to Next Paint)** replaced FID in March 2024. This is a critical interview differentiator.

```
FID (old): Measured delay before FIRST interaction was processed
           Problem: Only measured ONE interaction. If the 50th click was slow, FID didn't care.

INP (new): Measures ALL interactions throughout page lifecycle
           Reports the p98 worst interaction (not the absolute worst, to avoid outliers)
           A page with 100 interactions: INP = the 98th worst response time
```

**Why INP is harder to pass than FID:**
- FID only cared about the first click → pages often optimized first load but had sluggish later interactions
- INP catches: slow event handlers, long tasks blocking main thread, heavy re-renders during interaction

**How to measure INP:**

```javascript
// Using web-vitals library (production RUM monitoring)
import { onINP } from 'web-vitals';

onINP((metric) => {
  console.log('INP:', metric.value, 'ms');
  console.log('Element:', metric.entries[0].target); // Which element was slow
  
  // Send to analytics
  sendToDataDog({
    name: 'INP',
    value: metric.value,
    rating: metric.rating, // "good" | "needs-improvement" | "poor"
    page: window.location.pathname,
  });
});
```

**How to fix poor INP:**

```jsx
// CAUSE: Heavy state update blocks the main thread during interaction
function SearchPage() {
  const [results, setResults] = useState(allProducts);
  
  // ❌ BAD: Filtering 100K products on every keystroke
  function handleSearch(query) {
    const filtered = allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    ); // Takes 200ms → INP > 200ms → POOR
    setResults(filtered);
  }
  
  // ✅ FIX 1: useTransition — mark as non-urgent
  function handleSearch(query) {
    startTransition(() => {
      setResults(allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      ));
    });
    // Input responds immediately, filtering happens at lower priority
  }
  
  // ✅ FIX 2: Web Worker — move computation off main thread
  function handleSearch(query) {
    worker.postMessage({ type: 'FILTER', query, products: allProducts });
    // Main thread is free → instant INP
  }
  
  // ✅ FIX 3: Debounce + virtual list
  const deferredQuery = useDeferredValue(query);
  // Don't even filter until user stops typing
}
```

### Real-World: How to Achieve 95+ Lighthouse (Your EMB Global Experience)

```
Step 1: MEASURE (know what's broken)
─────────────────────────────────────
- Lighthouse CI in GitHub Actions — fail build if score drops below 90
- Web Vitals library → DataDog RUM — monitor field data from real users
- Weekly performance review in sprint retro — track trends

Step 2: LCP OPTIMIZATION
─────────────────────────
- Identify LCP element (usually hero image or main heading)
- For images: <Image priority /> in Next.js (adds preload)
- Self-host fonts with next/font (eliminates external request)
- Reduce TTFB: edge caching, streaming SSR
- Don't lazy-load above-the-fold content

Step 3: CLS OPTIMIZATION
──────────────────────────
- ALWAYS set width + height on <Image> (or use fill with aspect-ratio)
- next/font → zero layout shift for fonts
- Reserve space for async content (skeleton screens)
- Never inject content above existing content

Step 4: INP OPTIMIZATION
──────────────────────────
- Profile interactions with Chrome DevTools Performance tab
- Break long tasks: startTransition for non-urgent updates
- Virtualize large lists (react-virtuoso)
- Debounce search inputs
- Move heavy computation to Web Workers

Step 5: BUNDLE SIZE
────────────────────
- @next/bundle-analyzer to visualize what's in your bundle
- Dynamic imports for below-fold components
- Tree shake: use named imports, avoid barrel files
- Check for duplicate dependencies (npm ls)
```

---

## 5.2 Bundle Optimization — `HIGH PRIORITY`

### Code Splitting

```jsx
// React.lazy + Suspense for route-based splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Next.js dynamic import with SSR disabled (for client-only components)
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('./Chart'), { 
  ssr: false,                              // Don't render on server
  loading: () => <ChartSkeleton />,        // Show while loading
});
```

### Tree Shaking Best Practices

```javascript
// ✅ Named imports — tree-shakeable
import { debounce } from 'lodash-es';  // Only debounce is bundled

// ❌ Default import — entire library bundled
import _ from 'lodash';                 // ALL of lodash is bundled

// ❌ AVOID barrel files (index.ts that re-exports everything)
// components/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { Chart } from './Chart'; // Importing Button pulls in Chart too!

// ✅ Import directly from component file
import { Button } from './components/Button';
```

### Bundle Analysis

```bash
# Next.js
npm install @next/bundle-analyzer
# In next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer(nextConfig);

# Run: ANALYZE=true npm run build
```

---

## 5.3 Rendering Optimization — `HIGH PRIORITY`

### Debounce vs Throttle

```typescript
// DEBOUNCE: Wait until user STOPS typing for 300ms, then execute once
// Use for: search input, form validation, resize handler
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// THROTTLE: Execute at most once every 300ms during continuous events
// Use for: scroll handler, mousemove, progress updates
function useThrottle<T>(value: T, interval = 300): T {
  const [throttled, setThrottled] = useState(value);
  const lastUpdated = useRef(Date.now());
  
  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  
  return throttled;
}
```

| Feature | Debounce | Throttle |
|---------|----------|----------|
| **Fires** | Once, after delay with no new calls | At regular intervals during continuous calls |
| **Example** | Search: user types "react" → fires once after they stop | Scroll: fires every 100ms while scrolling |
| **Analogy** | Elevator door: waits until no one else enters | Metronome: ticks at fixed rate regardless |

### Web Workers

```javascript
// worker.js
self.onmessage = function(e) {
  const { data, operation } = e.data;
  // Heavy computation OFF the main thread
  const result = processLargeDataset(data, operation);
  self.postMessage(result);
};

// Component
function DataProcessor() {
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    workerRef.current = new Worker('/worker.js');
    workerRef.current.onmessage = (e) => setResult(e.data);
    return () => workerRef.current?.terminate();
  }, []);
  
  const process = (data) => {
    workerRef.current?.postMessage({ data, operation: 'aggregate' });
  };
}
```

---

## 5.4 Profiling & Monitoring — `MEDIUM PRIORITY`

### Theory: The Performance Debugging Workflow

```
STEP 1: Identify the symptom
─────────────────────────────
"The page feels slow" is not actionable. Be specific:
- Slow initial load? → LCP / bundle size issue
- Slow after interaction? → INP / heavy re-render issue
- Content jumping around? → CLS / layout shift issue
- Specific component slow? → Render optimization issue

STEP 2: Measure with React DevTools Profiler
─────────────────────────────────────────────
1. Open React DevTools → Profiler tab
2. Click Record → interact with the page → Stop
3. Read the Flamegraph:
   - Each bar = one component render
   - Width = render time (wider = slower)
   - Color: gray = didn't render, blue/green = rendered
   - Yellow/red = slow render (>16ms)
4. Click "Ranked" view to see slowest components sorted

STEP 3: Drill into slow components
────────────────────────────────────
Click a component in the Profiler to see:
- "Why did this render?" — props changed, state changed, parent rendered, or hook changed
- If "parent rendered" → this component doesn't need to re-render (optimization candidate)
- If "props changed" → check which prop. If it's a callback, use useCallback in parent.

STEP 4: Measure with Chrome DevTools Performance
──────────────────────────────────────────────────
1. Performance tab → Record → interact → Stop
2. Look for:
   - Long Tasks (red bars, >50ms) — these block the main thread
   - Layout Thrashing — rapid read/write cycles on DOM
   - Forced Reflows — JavaScript forcing the browser to recalculate layout
3. Coverage tab (Ctrl+Shift+P → "Coverage"):
   - Shows unused CSS/JS per file
   - Red = unused code (candidate for code splitting)
```

### Real-World: Production Monitoring Setup

```typescript
// Web Vitals monitoring sent to analytics
import { onCLS, onINP, onLCP } from 'web-vitals';

function reportWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
}

function sendToAnalytics(metric) {
  // DataDog RUM
  datadogRum.addAction('web_vital', {
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
    navigationType: metric.navigationType,
    url: window.location.href,
    // Include the element that caused poor score
    element: metric.entries[0]?.element?.tagName,
  });
}

// Lighthouse CI in GitHub Actions
// .lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-byte-weight': ['warn', { maxNumericValue: 500000 }], // 500KB budget
      },
    },
  },
};
```

---

# 6. TESTING

## 6.1 React Testing Library — `HIGH PRIORITY`

### Query Priority (Follow This Order)

```
1. getByRole       — accessible to everyone (screen readers, users)
2. getByLabelText  — form elements with labels
3. getByText       — visible text content
4. getByTestId     — LAST RESORT (not accessible to users)
```

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits form with user data', async () => {
  const user = userEvent.setup(); // Always use userEvent.setup()
  const onSubmit = jest.fn();
  
  render(<UserForm onSubmit={onSubmit} />);
  
  // Prefer getByRole over getByTestId
  await user.type(screen.getByRole('textbox', { name: /email/i }), 'dharma@test.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  // Async assertion
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ email: 'dharma@test.com' });
  });
});

// Testing custom hooks
import { renderHook, act } from '@testing-library/react';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => { result.current.increment(); });
  
  expect(result.current.count).toBe(1);
});
```

### `userEvent` vs `fireEvent`

| Feature | `userEvent` | `fireEvent` |
|---------|-------------|-------------|
| **Realism** | Simulates full user interaction (focus, keydown, input, keyup) | Fires single DOM event |
| **Async** | Yes (returns promises) | Synchronous |
| **Use when** | Almost always (default choice) | Testing specific low-level events |

---

## 6.2 Jest Patterns — `HIGH PRIORITY`

```javascript
// Mocking
jest.mock('./api', () => ({
  fetchUser: jest.fn(),
}));

// Spy on existing method
const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
afterEach(() => spy.mockRestore());

// Timer mocks
jest.useFakeTimers();
fireEvent.change(input, { target: { value: 'query' } });
jest.advanceTimersByTime(300); // Advance debounce timer
expect(onSearch).toHaveBeenCalledWith('query');
jest.useRealTimers();

// Module mock with implementation
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
    query: { id: '1' },
  }),
}));
```

---

## 6.3 Cypress vs Playwright — `HIGH PRIORITY`

### The Comparison

| Feature | Cypress | Playwright |
|---------|---------|------------|
| **Speed** | Slower (runs in browser) | 35-45% faster (parallel, multi-browser) |
| **Browsers** | Chrome, Firefox, Edge | Chrome, Firefox, Safari, Edge |
| **Multi-tab** | Not supported | Full support |
| **Architecture** | In-browser (same event loop) | Out-of-process (browser protocol) |
| **API mocking** | `cy.intercept()` | `page.route()` |
| **DX** | Better for frontend teams (time-travel UI) | Better for complex flows |
| **NPM downloads** | Overtaken by Playwright mid-2024 | Leading as of 2024 |

```javascript
// Cypress
cy.visit('/login');
cy.get('[data-testid="email"]').type('dharma@test.com');
cy.intercept('POST', '/api/login', { token: 'abc123' }).as('login');
cy.get('button[type="submit"]').click();
cy.wait('@login');
cy.url().should('include', '/dashboard');

// Playwright
await page.goto('/login');
await page.getByLabel('Email').fill('dharma@test.com');
await page.route('/api/login', route => route.fulfill({
  body: JSON.stringify({ token: 'abc123' }),
}));
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page).toHaveURL(/dashboard/);
```

---

## 6.4 MSW (Mock Service Worker) — `MEDIUM PRIORITY`

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Dharma' },
      { id: 2, name: 'Arjun' },
    ]);
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Override for specific test
test('handles server error', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
    })
  );
  // Test error UI...
});
```

**Why MSW > jest.mock for API:**
- Same handlers work in tests, Storybook, and development
- Intercepts at the network level (not implementation level)
- No mock implementation leakage — your code makes real `fetch` calls

---

## 6.5 Testing in Practice — Theory & Real-World Use Cases

### Theory: The Testing Trophy (Not Pyramid)

The traditional "testing pyramid" (many unit tests, fewer integration, few E2E) doesn't work well for frontend. Kent C. Dodds introduced the **Testing Trophy:**

```
      ╭──────╮
      │ E2E  │  ← Few: critical user paths (login, checkout)
      ╰──────╯
    ╭──────────╮
    │Integration│  ← MOST TESTS HERE: render component + test behavior
    ╰──────────╯
   ╭────────────╮
   │   Unit     │  ← Some: pure functions, hooks, utilities
   ╰────────────╯
  ╭──────────────╮
  │ Static Types │  ← Free: TypeScript catches errors at compile time
  ╰──────────────╯
```

**Why integration tests > unit tests for frontend:**
- Unit testing a `<Button>` in isolation tells you it renders. But does it work in the actual form?
- Integration tests render a component WITH its children and test real user behavior
- "The more your tests resemble the way your software is used, the more confidence they can give you" — Kent C. Dodds

### Real-World: Testing a Complete Feature

```tsx
// TESTING: User can search products, filter by category, and add to cart
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductPage from './ProductPage';

// MSW handlers — shared between tests, Storybook, and dev
const handlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    
    let products = mockProducts;
    if (search) products = products.filter(p => p.name.includes(search));
    if (category) products = products.filter(p => p.category === category);
    
    return HttpResponse.json({ data: products, total: products.length });
  }),
  
  http.post('/api/cart', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ cartId: 'cart-123', items: [body] }, { status: 201 });
  }),
];

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to render with providers
function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // No retry in tests
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('Product Page', () => {
  test('user can search, filter, and add product to cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductPage />);
    
    // Wait for initial product load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /MacBook Pro/i })).toBeInTheDocument();
    });
    
    // Search for a product
    await user.type(screen.getByRole('searchbox'), 'iPhone');
    
    // Wait for filtered results (debounced)
    await waitFor(() => {
      expect(screen.queryByText(/MacBook Pro/i)).not.toBeInTheDocument();
      expect(screen.getByText(/iPhone 15/i)).toBeInTheDocument();
    });
    
    // Add to cart
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    
    // Verify success feedback
    await waitFor(() => {
      expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
    });
  });
  
  test('shows error state when API fails', async () => {
    // Override handler for this test only
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      })
    );
    
    renderWithProviders(<ProductPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });
});
```

### Real-World: Jest Mock Patterns

```typescript
// PATTERN 1: Mock a module
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), pathname: '/dashboard' }),
  useSearchParams: () => new URLSearchParams('?tab=analytics'),
  usePathname: () => '/dashboard',
}));

// PATTERN 2: Spy on a method with implementation
const pushSpy = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy }),
}));

test('redirects after form submit', async () => {
  // ... submit form
  expect(pushSpy).toHaveBeenCalledWith('/success');
});

// PATTERN 3: Timer mocks for debounce testing
test('debounces search input', async () => {
  jest.useFakeTimers();
  const onSearch = jest.fn();
  render(<SearchInput onSearch={onSearch} />);
  
  await userEvent.type(screen.getByRole('searchbox'), 'react');
  
  // onSearch not called yet (debounced)
  expect(onSearch).not.toHaveBeenCalled();
  
  // Advance timer past debounce delay
  jest.advanceTimersByTime(300);
  
  expect(onSearch).toHaveBeenCalledWith('react');
  jest.useRealTimers();
});

// PATTERN 4: Testing custom hooks
import { renderHook, act, waitFor } from '@testing-library/react';

test('useDebounce returns debounced value', async () => {
  jest.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: '' } }
  );
  
  expect(result.current).toBe('');
  
  rerender({ value: 'hello' });
  expect(result.current).toBe(''); // Still old value
  
  act(() => jest.advanceTimersByTime(300));
  expect(result.current).toBe('hello'); // Now updated
  
  jest.useRealTimers();
});
```

---



---

# 7. CSS & STYLING

## 7.1 Tailwind CSS Advanced — `HIGH PRIORITY`

```jsx
// Arbitrary values
<div className="bg-[#1a1a2e] text-[13px] grid-cols-[200px_1fr_200px]" />

// Group/Peer modifiers
<div className="group">
  <button className="group-hover:bg-blue-600">Hover parent, I change</button>
</div>

<input className="peer" />
<p className="peer-invalid:text-red-500 hidden peer-invalid:block">
  Invalid input
</p>

// Container queries
<div className="@container">
  <div className="@lg:flex @sm:grid">Responsive to container, not viewport</div>
</div>

// Dark mode with class strategy
<html className="dark">
  <div className="bg-white dark:bg-gray-900 text-black dark:text-white" />
</html>

// cn() utility — the INDUSTRY STANDARD for conditional classes
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage: merges and deduplicates Tailwind classes
cn('px-4 py-2', isActive && 'bg-blue-500', 'px-8');
// Result: 'py-2 px-8 bg-blue-500' (px-8 overrides px-4)
```

---

## 7.2 Design System Architecture — `HIGH PRIORITY`

### Atomic Design Hierarchy

```
ATOMS        → Button, Input, Badge, Icon, Label
MOLECULES    → SearchBar (Input + Button), FormField (Label + Input + Error)
ORGANISMS    → Header (Logo + Nav + SearchBar), UserCard (Avatar + Name + Actions)
TEMPLATES    → DashboardLayout (Sidebar + Header + Content area)
PAGES        → AnalyticsDashboard (Template + real data)
```

### Compound Component Pattern

```jsx
// Instead of one monolithic component with 20 props:
// ❌ <Select options={[]} placeholder="..." disabled={...} error={...} />

// ✅ Composition pattern:
<Select value={selected} onChange={setSelected}>
  <Select.Trigger placeholder="Choose..." />
  <Select.Content>
    <Select.Item value="react">React</Select.Item>
    <Select.Item value="vue">Vue</Select.Item>
    <Select.Item value="angular">Angular</Select.Item>
  </Select.Content>
</Select>
```

### Design Tokens via CSS Variables

```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --radius-md: 0.375rem;
  --font-size-body: 1rem;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.1);
}

.dark {
  --color-primary: #60a5fa;
  --color-primary-hover: #93c5fd;
}
```

---

## 7.3 CSS-in-JS Comparison — `MEDIUM PRIORITY`

| Solution | Runtime | Bundle | Type-safe | Trend |
|----------|---------|--------|-----------|-------|
| **Styled-components / Emotion** | Runtime CSS generation | Moderate | Good | Declining |
| **CSS Modules** | Build-time scoped classes | Zero runtime | No | Stable |
| **Tailwind CSS** | Utility-first, build-time purge | Zero runtime | No (but cn() helps) | Growing fast |
| **Panda CSS / Vanilla Extract** | Build-time, zero-runtime | Zero runtime | Excellent | Emerging |

**Industry trend:** Moving AWAY from runtime CSS-in-JS (styled-components) toward zero-runtime solutions (Tailwind, Panda CSS). The React team itself recommended this shift for Server Components compatibility.

---

## 7.4 CSS & Styling in Practice — Real-World Design System

### Theory: Why Tailwind Won the CSS Battle

The CSS-in-JS ecosystem went through three phases:
1. **CSS Modules (2015)** — scoped class names, no naming collisions, but verbose
2. **Styled-components/Emotion (2017)** — CSS in JS, dynamic styling, but RUNTIME overhead
3. **Tailwind CSS (2019)** — utility classes, ZERO runtime, but controversial at first

**Why runtime CSS-in-JS is dying:**
- Styled-components generates CSS at **runtime** — adds 10-15KB to bundle + CPU cost per render
- Server Components can't use runtime CSS-in-JS (no JS execution on server)
- React team officially recommended moving away from runtime CSS-in-JS for Server Components

**Why Tailwind won:**
- Zero runtime — all CSS generated at build time, unused CSS purged
- Co-located with HTML — no switching between files
- Consistent design system — spacing/color scales enforced
- Perfect for Server Components — no JS needed
- Tiny production CSS — typically 10-30KB for entire app

### Real-World: Building a Design System with Tailwind

```tsx
// The cn() utility — INDUSTRY STANDARD (every Tailwind project uses this)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// WHY twMerge matters:
cn('px-4 py-2', 'px-8')           // → 'py-2 px-8' (px-8 wins over px-4)
cn('text-red-500', 'text-blue-500') // → 'text-blue-500' (last wins)
// Without twMerge: 'px-4 py-2 px-8' (BOTH applied — CSS specificity decides)

// Variant-based component with cva (class-variance-authority)
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base classes — always applied
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'hover:bg-gray-100 focus:ring-gray-500',
        link: 'underline-offset-4 hover:underline text-blue-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ ref, className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Usage:
<Button variant="primary" size="lg">Submit</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>
<Button className="w-full">Full Width</Button> // className override works thanks to cn()
```

### Design Tokens via CSS Variables — Real-World Multi-Tenant Theming

```css
/* Base theme tokens — applied to :root */
:root {
  --color-primary: 59 130 246;        /* blue-500 as RGB values */
  --color-primary-hover: 37 99 235;   /* blue-600 */
  --color-background: 255 255 255;
  --color-foreground: 15 23 42;
  --color-muted: 100 116 139;
  --radius: 0.375rem;
  --font-sans: 'Inter', system-ui, sans-serif;
}

/* Dark mode — just override the tokens */
.dark {
  --color-primary: 96 165 250;        /* blue-400 */
  --color-background: 15 23 42;
  --color-foreground: 248 250 252;
}

/* Per-tenant override — loaded dynamically */
.tenant-hdfc {
  --color-primary: 0 76 153;          /* HDFC blue */
  --color-primary-hover: 0 60 120;
}

.tenant-bajaj {
  --color-primary: 0 119 190;         /* Bajaj blue */
}
```

```jsx
// Apply tenant theme from server
export default function TenantLayout({ children, params }) {
  const tenant = await getTenantConfig(params.tenantId);
  return (
    <html className={`tenant-${tenant.slug}`}>
      <body>{children}</body>
    </html>
  );
}
```

---



---

# 8. ACCESSIBILITY

## 8.1 WCAG 2.1 Essentials — `MEDIUM PRIORITY`

### The 4 Principles (POUR)

1. **Perceivable** — Content can be perceived (alt text, captions, contrast)
2. **Operable** — Interface can be operated (keyboard nav, no seizure triggers)
3. **Understandable** — Content is understandable (clear language, predictable behavior)
4. **Robust** — Works with assistive technology (semantic HTML, ARIA)

### Key Requirements

- **Color contrast:** 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+)
- **Keyboard navigation:** All interactive elements must be focusable and operable via keyboard
- **Focus management in SPAs:** When route changes, move focus to new content or announce via `aria-live`
- **Skip links:** Allow keyboard users to skip navigation and jump to main content

```jsx
// Focus trapping in modals
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const previouslyFocused = document.activeElement;
    modalRef.current?.querySelector('button, [href], input')?.focus();
    
    return () => previouslyFocused?.focus(); // Restore focus on close
  }, [isOpen]);

  return isOpen ? createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef}>
      {children}
    </div>,
    document.body
  ) : null;
}
```

---

## 8.2 ARIA for Dashboards — `MEDIUM PRIORITY`

```jsx
// Live region for real-time data updates
<div aria-live="polite">
  API calls: {count} {/* Screen reader announces when count changes */}
</div>

// Loading state
<div aria-busy={isLoading}>
  {isLoading ? <Spinner /> : <DataTable />}
</div>

// Error messages
<div role="alert">Payment failed. Please try again.</div>

// Status updates (non-urgent)
<div role="status">3 items selected</div>

// Icon-only buttons MUST have labels
<button aria-label="Close modal"><XIcon /></button>

// Form error association
<input aria-describedby="email-error" aria-invalid={!!error} />
<p id="email-error" role="alert">{error}</p>
```

---

## 8.3 Accessibility in Practice — Real-World Dashboard A11y

### Theory: Why Accessibility Is a Business Requirement

1. **Legal:** WCAG 2.1 AA compliance is legally required in many jurisdictions. Companies get sued for inaccessible websites (Dominos Pizza, Netflix, etc.)
2. **Market:** 15% of the world's population has a disability. That's 1 billion potential users.
3. **SEO:** Accessible websites have better semantic HTML → better SEO
4. **Enterprise clients:** Companies like HDFC Bank require WCAG compliance from all vendors. TartanHQ can't sell to them without it.

### Real-World: Making a Dashboard Accessible

```jsx
// PROBLEM: Real-time dashboard with updating numbers
// Screen readers need to know when values change

function MetricCard({ label, value, trend, isLoading }) {
  return (
    <div 
      role="region" 
      aria-label={`${label} metric`}
      aria-busy={isLoading}
    >
      <h3 id={`metric-${label}`}>{label}</h3>
      
      {/* aria-live="polite" — screen reader announces changes */}
      {/* Only when user isn't doing something else */}
      <div aria-live="polite" aria-atomic="true">
        <span className="text-3xl font-bold">{value}</span>
        <span 
          className={trend > 0 ? 'text-green-500' : 'text-red-500'}
          aria-label={`${Math.abs(trend)}% ${trend > 0 ? 'increase' : 'decrease'}`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}

// PROBLEM: Icon-only buttons with no visible text
// ❌ BAD:
<button onClick={onClose}><XIcon /></button>  // Screen reader: "button"

// ✅ GOOD:
<button onClick={onClose} aria-label="Close modal"><XIcon /></button>
// Screen reader: "Close modal, button"

// PROBLEM: Form errors not announced to screen readers
function FormField({ label, error, ...inputProps }) {
  const errorId = `error-${inputProps.name}`;
  return (
    <div>
      <label htmlFor={inputProps.name}>{label}</label>
      <input
        id={inputProps.name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
// When error appears:
// role="alert" → screen reader announces it immediately
// aria-describedby → links error to the input (context)
// aria-invalid → indicates the field has an error
```

### Focus Management in SPAs — The Most Forgotten A11y Issue

```jsx
// PROBLEM: In SPAs, route changes don't trigger focus change
// Keyboard users and screen readers get "lost" on navigation
// They're still focused on the link they clicked, not the new page content

// SOLUTION: Focus management on route change
function useRouteAnnouncer() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  
  useEffect(() => {
    if (pathname !== previousPath.current) {
      // Option 1: Focus the main content heading
      const heading = document.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
      
      // Option 2: Announce the route change
      const announcement = document.getElementById('route-announcer');
      if (announcement) {
        announcement.textContent = `Navigated to ${document.title}`;
      }
      
      previousPath.current = pathname;
    }
  }, [pathname]);
}

// In layout:
<div id="route-announcer" role="status" aria-live="assertive" className="sr-only" />
```

---



---

# 9. ARCHITECTURE

## 9.1 Micro-Frontends — `HIGH PRIORITY`

### Theory: When Micro-Frontends Make Sense (and When They Don't)

```
USE MICRO-FRONTENDS WHEN:
─────────────────────────
✅ Multiple teams (3+) need to deploy independently
✅ Different products share a common shell (TartanHQ: HyperVerify + HyperSync + HyperApps)
✅ Teams use different frameworks (legacy Angular + new React)
✅ Different release cycles per product area
✅ Organization is scaling — new teams join frequently

DON'T USE WHEN:
────────────────
❌ Small team (< 8 developers)
❌ Single framework across entire app
❌ Simple application with few features
❌ Tight coupling between features (shared state everywhere)
❌ The added complexity isn't justified by team autonomy
```

### Real-World: TartanHQ's 3-Product Architecture

```
TartanHQ has 3 products: HyperVerify, HyperSync, HyperApps
Each can be developed and deployed independently.

Architecture:
┌─────────────────────────────────────────────────────────┐
│  HOST APPLICATION (shell)                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Shared Header / Navigation / Auth                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │HyperVerify │  │ HyperSync  │  │ HyperApps  │       │
│  │  (Team A)  │  │  (Team B)  │  │  (Team C)  │       │
│  │            │  │            │  │            │       │
│  │ KYC flows  │  │ Data sync  │  │ AI agents  │       │
│  │ Docs verify│  │ API pipes  │  │ Form builder│       │
│  └────────────┘  └────────────┘  └────────────┘       │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Shared Design System (@tartanhq/ui)              │  │
│  │  Shared Utilities (@tartanhq/utils)               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Key decisions:
1. Module Federation for runtime loading (no rebuild of shell when product updates)
2. Shared React + React DOM (one copy, not 3)
3. Shared design system npm package (consistent UI)
4. Each product has its own CI/CD pipeline
5. Shared auth via shell — products don't handle login
```

---

## 9.2 Monorepo Setup — `MEDIUM PRIORITY`

```
my-monorepo/
├── apps/
│   ├── web/          # Next.js main app
│   ├── docs/         # Documentation site
│   └── admin/        # Admin dashboard
├── packages/
│   ├── ui/           # Shared component library
│   ├── utils/        # Shared utility functions
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared ESLint, Tailwind, TS configs
├── turbo.json        # Turborepo build orchestration
├── pnpm-workspace.yaml
└── package.json
```

**Turborepo benefits:**
- **Remote caching:** Don't rebuild what hasn't changed (even across CI machines)
- **Parallel execution:** Build independent packages simultaneously
- **Task dependencies:** Ensures correct build order (types → utils → ui → apps)

---

## 9.3 API Integration Patterns — `HIGH PRIORITY`

### Theory: Why an Abstraction Layer Matters

Without an API abstraction layer, every component calls `fetch()` directly. This means:
1. Auth token management duplicated everywhere
2. Error handling inconsistent (some catch, some don't)
3. Retry logic absent or different per component
4. Changing the API base URL requires touching 50+ files
5. Testing requires mocking `fetch` globally

### Real-World: Production API Client

```typescript
// lib/api-client.ts
class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Interceptor: Add auth header
    const token = getAccessToken();
    const headers = new Headers(options.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url, { ...options, headers });
    
    // Interceptor: Handle 401 with token refresh
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        headers.set('Authorization', `Bearer ${getAccessToken()}`);
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) throw new APIError(retryResponse);
        return retryResponse.json();
      }
      // Refresh failed — redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    
    // Interceptor: Handle errors
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new APIError(response.status, errorBody?.message || response.statusText, errorBody);
    }
    
    return response.json();
  }
  
  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  
  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Custom error class with structured info
class APIError extends Error {
  status: number;
  body: unknown;
  
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
  
  get isNotFound() { return this.status === 404; }
  get isUnauthorized() { return this.status === 401; }
  get isServerError() { return this.status >= 500; }
  get isRateLimited() { return this.status === 429; }
}

export const api = new APIClient(process.env.NEXT_PUBLIC_API_URL);

// Usage with TanStack Query:
const { data } = useQuery({
  queryKey: ['metrics', clientId],
  queryFn: () => api.get<MetricsResponse>(`/metrics/${clientId}`),
  retry: (failureCount, error) => {
    if (error instanceof APIError && error.isNotFound) return false; // Don't retry 404
    return failureCount < 3;
  },
});
```

### SSE vs WebSockets vs Polling — When to Use Each

```
SCENARIO                          | Best Choice    | Why
──────────────────────────────────|───────────────-|────────────────────────────────
Dashboard metrics (1-way stream)  | SSE            | Server→client only, auto-reconnect, HTTP/2
Chat application (bidirectional)  | WebSockets     | Both sides send messages
Collaborative editing (real-time) | WebSockets     | Need bidirectional, low latency
Email inbox (check for new)       | Polling (30s)  | Infrequent updates, simple
Live stock prices (high frequency)| WebSockets     | Sub-second updates, bidirectional
Notification bell (periodic)      | SSE            | Server pushes when new, auto-reconnect
File upload progress              | SSE            | Server→client progress updates
Online multiplayer game           | WebSockets     | Sub-50ms latency required
```

```typescript
// SSE Implementation for dashboard
function useDashboardStream(clientId: string) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/stream/metrics?client=${clientId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);
    };
    
    eventSource.onerror = () => {
      // SSE auto-reconnects! Unlike WebSockets.
      // Browser handles reconnection automatically with exponential backoff.
      console.log('SSE connection lost, auto-reconnecting...');
    };
    
    return () => eventSource.close();
  }, [clientId]);
  
  return metrics;
}
```

---

## 9.4 Authentication & RBAC — `MEDIUM PRIORITY`

### Theory: Why httpOnly Cookies > localStorage for Tokens

```
ATTACK: Cross-Site Scripting (XSS)
─────────────────────────────────────
If an attacker injects JavaScript into your page:

localStorage: token = localStorage.getItem('token')
  → Attacker's script CAN read this → Token STOLEN
  → Attacker sends token to their server → Full account takeover

httpOnly Cookie: document.cookie cannot access httpOnly cookies
  → Attacker's script CANNOT read the token
  → Cookie is automatically sent with requests, but JS can't extract it
  → Token is SAFE even during XSS attack
```

### Real-World: Complete Auth Flow in Next.js

```typescript
// 1. Login Server Action
'use server';
export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Call auth API
  const { accessToken, refreshToken } = await authAPI.login(email, password);
  
  // Store refresh token in httpOnly cookie (NOT accessible by JavaScript)
  cookies().set('refresh-token', refreshToken, {
    httpOnly: true,      // JS can't read it — XSS protection
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  
  // Store access token in httpOnly cookie too (short-lived)
  cookies().set('access-token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });
  
  redirect('/dashboard');
}

// 2. Middleware for route protection
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access-token');
  const refreshToken = request.cookies.get('refresh-token');
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  // No tokens + protected page → redirect to login
  if (!accessToken && !refreshToken && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Has tokens + auth page → redirect to dashboard
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // RBAC: Check role for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const payload = decodeJWT(accessToken.value);
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
}

// 3. RBAC in UI — hide elements based on role
function useAuth() {
  // Get user from server-set cookie or session
  const user = useContext(AuthContext);
  
  return {
    user,
    hasRole: (role: string) => user?.role === role,
    hasPermission: (permission: string) => user?.permissions?.includes(permission),
    isAdmin: user?.role === 'admin',
  };
}

// Component-level RBAC
function DashboardActions() {
  const { hasPermission, isAdmin } = useAuth();
  
  return (
    <div>
      <button>View Reports</button>  {/* Everyone */}
      
      {hasPermission('export') && (
        <button>Export Data</button>  {/* Only users with export permission */}
      )}
      
      {isAdmin && (
        <button>Manage Users</button>  {/* Admin only */}
      )}
    </div>
  );
}

// CRITICAL: Never trust client-side RBAC alone
// Always validate permissions on the SERVER too
// Client RBAC is for UX (hide buttons), not security
```


---

# 10. SYSTEM DESIGN

## 10.1 Design a Real-Time API Analytics Dashboard

### Requirements
- Real-time updates (1-5s intervals)
- 100K+ data points, filterable by client/API/time range
- Exportable reports
- 50+ enterprise clients

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER                                                    │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Filters │  │ Metrics  │  │ Chart     │  │ Log Table │  │
│  │ (Zustand)│  │ (SSE)   │  │(Web Worker)│  │(Virtualized)│ │
│  └─────────┘  └──────────┘  └───────────┘  └───────────┘  │
│       │             │              │               │        │
│       └─────────────┴──────────────┴───────────────┘        │
│                          │                                   │
│                   TanStack Query                             │
│                   (staleTime: 5s)                            │
└──────────────────────────│───────────────────────────────────┘
                           │
                    SSE Connection
                           │
┌──────────────────────────│───────────────────────────────────┐
│  SERVER                  │                                   │
│  ┌──────────┐  ┌─────────┐  ┌──────────────┐               │
│  │ SSE      │  │ REST    │  │ Aggregation  │               │
│  │ Endpoint │  │ API     │  │ Service      │               │
│  └──────────┘  └─────────┘  └──────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### Key Decisions

**SSE over WebSockets:** One-way data stream, auto-reconnects, simpler infrastructure. WebSockets only needed for bidirectional communication (chat, gaming).

**Web Worker for charts:** Chart.js/D3 computations on 100K+ data points block main thread ~200ms. Worker processes data, posts aggregated result back.

**Virtualization:** 100K log rows = 100K DOM nodes = frozen UI. `react-virtuoso` renders only ~20 visible rows, handles variable heights.

**State split:** TanStack Query for server data (API metrics) + Zustand for UI state (selected filters, time range).

**Error isolation:** Each widget in its own `<ErrorBoundary>` + `<Suspense>`. If one widget crashes, others continue working.

---

## 10.2 Design a Multi-Tenant Admin Console

### Architecture

**Tenant detection:** Next.js middleware extracts tenant from subdomain (`acme.app.com`) or header. Injects into request context.

**Theming:** CSS Variables loaded per tenant from config. Variables change at runtime without rebuilds (unlike Tailwind config per tenant).

**RBAC:** `withPermission(Component, requiredRole)` HOC. Server-side validation in middleware — never trust client RBAC alone.

**Data Model:**
```typescript
type Tenant = { id: string; name: string; plan: string; theme: ThemeConfig; apiKeys: APIKey[]; members: Member[] };
type Member = { userId: string; tenantId: string; role: 'admin' | 'viewer' | 'developer'; permissions: Permission[] };
```

---

## 10.3 Design a Component Library / Design System

### Architecture

- **Monorepo:** `packages/ui`, `packages/tokens`, `packages/icons`
- **Build:** tsup (esbuild-based) for tree-shakeable ESM + CJS
- **Tokens:** CSS Variables for colors, spacing, typography
- **Docs:** Storybook with auto-generated API docs
- **Testing:** Visual regression (Chromatic) + unit tests (RTL)
- **Versioning:** Changesets for independent package versioning

### Component Design

```jsx
// Compound Component pattern
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>Content here</Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close>Cancel</Dialog.Close>
      <Button>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>

// Polymorphic component
<Button as="a" href="/page">I'm an anchor tag that looks like a button</Button>
```

---

## 10.4 Design an AI-Powered Form Builder

### Architecture
- **Drag-and-drop:** dnd-kit (accessible, composable)
- **Schema:** JSON-based form definition → Zod validation auto-generated
- **AI integration:** OpenAI/Claude function calling with JSON mode for reliable structured output
- **Streaming:** `useOptimistic` for instant feedback while AI generates fields
- **Conditional logic:** DAG (Directed Acyclic Graph) for field visibility rules

### Performance
- 100+ fields → virtualize field list
- React Hook Form (uncontrolled) to avoid re-renders on every keystroke

---

## 10.5 Design a Verification/KYC Flow UI

### State Machine
```typescript
type KYCState =
  | { step: 'document_upload'; progress: 0 }
  | { step: 'uploading'; progress: number }
  | { step: 'processing'; jobId: string }
  | { step: 'liveness_check' }
  | { step: 'verifying' }
  | { step: 'success'; verificationId: string }
  | { step: 'failed'; reason: string; canRetry: boolean };
```

**Key decisions:** Chunked file upload with presigned URLs (bypass backend for large files). Camera fallback to file input if permission denied. SessionStorage for progress persistence across refreshes. Clear sensitive PII on component unmount.

---

## 10.6–10.8 Quick Reference

**API Documentation Playground:** Monaco Editor for code input, split-pane layout, backend proxy for CORS/security, IndexedDB for request history, code generation (cURL, Node.js, Python).

**Notification System:** SSE for real-time, optimistic mark-as-read, virtualized infinite scroll list, `aria-live="polite"` for announcements, per-channel preferences.

**Feature Flag System:** Provider at app root, `useFeatureFlag('flag-name')` hook, percentage rollouts via `hash(userId + flagName) % 100`, cached with 5-min TTL, fallback to "off" if service unreachable.

---

# 11. MACHINE CODING

## 11.1 Build Autocomplete/Typeahead Search (45-60 min)

### Implementation

```tsx
function Autocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch with AbortController
  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    
    const controller = new AbortController();
    fetch(`/api/search?q=${debouncedQuery}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => { setResults(data); setIsOpen(true); })
      .catch(err => { if (err.name !== 'AbortError') console.error(err); });
    
    return () => controller.abort(); // Cancel previous request
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (selectedIndex >= 0) selectResult(results[selectedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div>
      <input
        role="combobox"
        aria-expanded={isOpen}
        aria-activedescendant={selectedIndex >= 0 ? `option-${selectedIndex}` : undefined}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul role="listbox">
          {results.map((item, i) => (
            <li
              key={item.id}
              id={`option-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => selectResult(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Common Mistakes to Avoid
- Not cancelling previous API calls (AbortController)
- Not debouncing (API on every keystroke)
- Missing keyboard navigation
- Not handling empty, loading, and error states

---

## 11.2 Build Data Table with Sorting & Filtering (60-90 min)

### Key Points
- **Generic component:** `DataTable<T extends Record<string, any>>`
- **Sorting:** `useMemo` for sorted data. NEVER `arr.sort()` (mutates). Use `[...arr].sort()`
- **Filtering:** Debounced per-column inputs. Combined: `filters.every(f => row[f.key].includes(f.value))`
- **Performance:** Virtualize for 10K+ rows. `useMemo` for filtered + sorted result
- **TypeScript:** Column type `{ key: keyof T; header: string; sortable?: boolean; render?: (value: T[keyof T]) => ReactNode }`

---

## 11.3 Build Multi-Step Form Wizard (60-90 min)

### Key Points
- **State machine:** `useReducer` with discriminated union actions
- **Per-step validation:** Zod schema per step + React Hook Form `zodResolver`
- **Data persistence:** Merge step data into accumulated form data
- **Progress recovery:** Save to sessionStorage on each step completion
- **Accessibility:** `aria-current="step"`, focus first input on step change

---

## 11.4 Build Kanban Board with Drag-and-Drop (90 min)

### Key Points
- **Library:** dnd-kit (accessible, composable) over react-beautiful-dnd (deprecated)
- **State:** Normalized: `{ columns: { id, cardIds[] }[], cards: Record<id, Card> }`
- **Optimistic updates:** Update local state on drop, fire API in background, revert on error
- **Cross-column moves:** `closestCorners` collision detection
- **Accessibility:** Keyboard drag-and-drop support via dnd-kit sensors

---

## 11.5 Build Modal/Dialog System (30-45 min)

### Key Points
- **Portal:** `createPortal(content, document.body)` to escape parent z-index/overflow
- **Focus trap:** Tab cycles within modal (first ↔ last focusable)
- **Restore focus:** Save `document.activeElement` before open, restore on close
- **Body scroll lock:** `document.body.style.overflow = 'hidden'`
- **Compound component:** `<Modal><Modal.Header/><Modal.Body/><Modal.Footer/></Modal>`

---

## 11.6 Build Polling/Real-time Data Component (45-60 min)

### Key Points
- **Recursive `setTimeout`** over `setInterval` (avoids overlapping requests)
- **`useRef` for callback** to avoid stale closure
- **Cleanup flag:** `cancelled = true` in useEffect cleanup
- **AbortController** for in-flight requests on unmount
- **Exponential backoff** on repeated errors

---

## 11.7 Build Infinite Scroll (45-60 min)

### Key Points
- **IntersectionObserver** on sentinel element at bottom (NOT scroll listener)
- **`rootMargin: '200px'`** to prefetch before reaching bottom
- **TanStack Query `useInfiniteQuery`** for data fetching with pagination
- **Virtualization** for already-loaded items
- **Cleanup:** Disconnect observer in useEffect cleanup

---

## 11.8 Build Theme Toggle (20-30 min)

### Key Points
- **FOUC prevention:** Inline `<script>` in `<head>` reads localStorage BEFORE React hydrates
- **CSS Variables** for all theme values (not Tailwind classes directly)
- **System preference:** `matchMedia('(prefers-color-scheme: dark)')`
- **Hydration safety:** Read from DOM class (set by inline script), not from state

---

# 12. SCENARIO-BASED QUESTIONS

## 12.1 Production 500 Error for 50+ Clients

**Framework: IMMEDIATE → DIAGNOSE → MITIGATE → COMMUNICATE → FIX → POST-MORTEM**

1. **IMMEDIATE (0-5 min):** Check error boundary UI — white screen or helpful fallback? Push hotfix with error boundary if white screen.
2. **DIAGNOSE (5-15 min):** Network tab — is it 500 (server) or 4xx (our bad request)? Is it all clients or specific ones?
3. **MITIGATE:** Serve cached/stale data via TanStack Query's `staleTime`. Show graceful degradation UI.
4. **COMMUNICATE:** Alert team in Slack immediately. Don't wait until fixed.
5. **FIX:** Address root cause + add regression test.
6. **POST-MORTEM:** Document what happened, why, and prevention measures.

---

## 12.2 Redux Everywhere Migration

**Your 4-bucket framework:**
1. **Audit** all Redux slices — categorize each as server data, global UI, local UI, or form state
2. **Server data** (60-80% of Redux) → TanStack Query (biggest win)
3. **Form state** → React Hook Form
4. **Local UI** → useState/useReducer
5. **Remaining global** → Keep Redux or migrate to Zustand
6. **Incremental migration** — never big-bang. POC one slice, measure, then expand.

---

## 12.3 Inaccessible Figma Design

1. Start with what's good: "I love the visual direction"
2. Provide **specific alternatives**: "This contrast is 2.5:1, WCAG needs 4.5:1. Here are 3 shades that pass."
3. Propose **design review checklist** the team adopts
4. Educate over time: share a11y wins in sprint retros

---

## 12.4 PR Review of Senior Engineer's Messy Code

1. **Assume positive intent** — they may be under deadline pressure
2. **Questions over directives:** "Would adding a Props interface help catch issues early?"
3. **Prioritize comments:** Label as 'blocking' vs 'nit' vs 'suggestion'
4. **Offer help:** "I can add the test file if you're tight on time"
5. **Systemic fix:** PR template, lint rules, pre-commit hooks

---

## 12.5 Remote Debugging for Enterprise Client

1. **Gather remotely:** Ask for Lighthouse JSON, Network waterfall screenshot, `navigator.connection` info
2. **Hypothesize:** Proxy/firewall blocking CDN? Old browser? SSL inspection adding latency?
3. **Instrument:** Add Web Vitals reporting, Resource Timing API, performance marks
4. **Optimize:** Reduce bundles, enable Brotli, implement service worker, preload critical resources

---

## 12.6 "Ship 2-Week Feature in 3 Days"

1. **Don't say "impossible."** Say: "Let me break this down."
2. **Scope negotiate:** Core feature (3 days) vs nice-to-haves (next sprint)
3. **Trade-off transparency:** "3 days if we skip: unit tests (add next sprint), pixel-perfect design, edge cases"
4. **Daily updates:** Day 1: core done. Day 2: API integration. Day 3: basic testing + deploy.
5. **Pay down debt after.** Don't let the 3-day hack become permanent.

---

## 12.7 SSR vs CSR Decision

| Choose SSR When | Choose CSR When |
|-----------------|-----------------|
| SEO matters | Dashboard behind auth (no SEO) |
| Fast first paint critical | Heavy interactivity |
| Server-side data access | Offline capability (PWA) |
| Reduce client JS bundle | Backend prefers client-owned fetching |

**TartanHQ answer:** Hybrid — Next.js App Router with Server Components for shell + Client Components for interactive widgets + Streaming SSR for best of both.

---

## 12.8–12.10 Quick References

**Redux vs Zustand team debate:** Facilitate with evaluation criteria, prototype same feature in both, decide with data, document decision in ADR (Architecture Decision Record).

**API response mismatch:** Never reshape in components. Create adapter/transformer layer. Type both API response and UI model. Communicate with backend for long-term fix (BFF, GraphQL, API contracts).

**Junior developer shipping messy code:** Private conversation first. Pair program to model practices. Systemic fixes (ESLint no-console, Prettier, Husky pre-commit hooks). Set growth goals. Celebrate progress publicly.

---

# 13. JAVASCRIPT INPUT-OUTPUT

## Q1: Hoisting & Temporal Dead Zone

```javascript
console.log(a);   // undefined — var is hoisted + initialized with undefined
console.log(b);   // ❌ ReferenceError — let is hoisted but NOT initialized (TDZ)
var a = 1;
let b = 2;
```

**Explanation:** Both `var` and `let/const` are hoisted (the engine knows they exist). But `var` is initialized with `undefined` at hoist time, while `let/const` stay in the **Temporal Dead Zone (TDZ)** from block start until the declaration line. Accessing them in TDZ throws `ReferenceError`.

---

## Q2: Closures + var vs let in Loop

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 3, 3, 3

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// Output: 0, 1, 2
```

**Explanation:**  
- `var i` is **function-scoped** — all 3 closures share the SAME `i`. After the loop, `i === 3`.
- `let j` is **block-scoped** — each iteration creates a NEW `j`. Each closure captures its own value.

This is the **#1 most asked closure question** in JavaScript interviews.

---

## Q3: Event Loop — Microtask vs Macrotask

```javascript
console.log("1");                              // 1. Sync
setTimeout(() => console.log("2"), 0);          // 3. Macrotask (waits)
Promise.resolve().then(() => console.log("3")); // 2. Microtask (higher priority)
console.log("4");                              // 1. Sync

// Output: 1, 4, 3, 2
```

**The rule:** Synchronous code first → Drain ALL microtasks → ONE macrotask → Drain ALL microtasks → repeat.

**Microtasks:** Promise.then, queueMicrotask, MutationObserver  
**Macrotasks:** setTimeout, setInterval, requestAnimationFrame, I/O

---

## Q4: `this` Binding

```javascript
const obj = {
  name: "Dharma",
  greet: function() { console.log(this.name); },
  greetArrow: () => { console.log(this.name); }
};

obj.greet();          // "Dharma" — regular function, this = obj
obj.greetArrow();     // undefined — arrow function, this = enclosing scope (not obj)

const greet = obj.greet;
greet();              // undefined — detached from obj, this = globalThis
```

**Arrow functions do NOT have their own `this`.** They capture `this` lexically from the enclosing scope. When `greetArrow` is defined inside `obj`, the enclosing scope is the module/global scope — not `obj`.

---

## Q5: Prototype Chain

```javascript
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() { return this.name; };

const dog = new Animal("Rex");
console.log(dog.speak());                  // "Rex"
console.log(dog.hasOwnProperty("name"));   // true — own property
console.log(dog.hasOwnProperty("speak"));  // false — on prototype
```

`name` is set on the instance via `this.name`. `speak` is on `Animal.prototype`. `hasOwnProperty` only checks the object itself, not the prototype chain.

---

## Q6: Type Coercion Madness

```javascript
console.log([] == ![]);         // true — ![] is false → [] == false → 0 == 0
console.log([] == false);       // true — both coerce to 0
console.log("" == false);       // true — both coerce to 0
console.log(null == undefined); // true — spec says they're loosely equal
console.log(null === undefined);// false — different types
console.log(NaN === NaN);       // false — NaN is not equal to anything!
```

**Use `===` always.** Use `Number.isNaN()` to check for NaN.

---

## Q7: Shallow vs Deep Copy

```javascript
const a = { x: 1, y: { z: 2 } };
const b = { ...a };

b.x = 10;
b.y.z = 20;

console.log(a.x);   // 1 — primitives are copied by value
console.log(a.y.z); // 20 — objects are copied by reference (SHARED)
```

**Spread (`...`) creates a SHALLOW copy.** Nested objects are shared references. For deep copy: `structuredClone(a)` or `JSON.parse(JSON.stringify(a))`.

---

## Q8: async/await Execution Order

```javascript
async function foo() {
  console.log("1");                              // Sync (before await)
  const x = await Promise.resolve("2");          // Pauses here
  console.log(x);                                // Resumes as microtask
  console.log("3");
}
console.log("4");  // Sync
foo();
console.log("5");  // Sync (foo is paused at await)

// Output: 4, 1, 5, 2, 3
```

**Key insight:** Everything BEFORE the first `await` in an async function runs synchronously. `await` pauses the function and returns control to the caller. The code after `await` runs as a microtask.

---

## Q9: Optional Chaining & Nullish Coalescing

```javascript
console.log(0 ?? "default");   // 0    — ?? only falls back for null/undefined
console.log(0 || "default");   // "default" — || falls back for ANY falsy value

console.log("" ?? "default");  // ""   — ?? preserves empty string
console.log("" || "default");  // "default" — || treats "" as falsy
```

**Critical difference:** `??` (nullish coalescing) only triggers for `null` and `undefined`. `||` (logical OR) triggers for ALL falsy values: `0`, `""`, `false`, `null`, `undefined`, `NaN`.

---

## Q10: Promise.all vs Promise.allSettled

```javascript
// Promise.all: FAILS FAST on first rejection
Promise.all([resolve(1), reject("error"), resolve(3)])
  .catch(console.error); // "error" — you lose results of resolve(1) and resolve(3)

// Promise.allSettled: WAITS FOR ALL, reports each
Promise.allSettled([resolve(1), reject("error"), resolve(3)])
  .then(console.log);
// [{ status: "fulfilled", value: 1 }, { status: "rejected", reason: "error" }, { status: "fulfilled", value: 3 }]
```

Use `allSettled` when you want results regardless of individual failures (batch API calls).

---

## Q11: Closures as Private State (Module Pattern)

```javascript
function createCounter() {
  let count = 0; // Private — not accessible outside
  return {
    increment: () => ++count,
    getCount: () => count
  };
}
const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
// counter.count → undefined (private!)
```

---

## Q12: Array Higher-Order Functions

```javascript
const arr = [1, 2, 3, 4, 5];
arr.map(x => x * 2);      // [2,4,6,8,10]  — transforms each element
arr.filter(x => x > 3);   // [4,5]          — keeps elements passing test
arr.reduce((acc, x) => acc + x, 0); // 15   — accumulates to single value
arr.find(x => x > 3);     // 4              — first match (not array)
arr.some(x => x > 4);     // true           — any passes?
arr.every(x => x > 0);    // true           — all pass?
// NONE of these mutate the original array
```

---

## Q13: Destructuring — Rename, Rest, Defaults

```javascript
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };
// a = 1, b = 2, rest = { c: 3, d: 4 }

const { x: myX = 10, y: myY = 20 } = { x: 5 };
// myX = 5 (renamed from x), myY = 20 (default, since y is undefined)
console.log(typeof x); // "undefined" — x was renamed to myX, x doesn't exist
```

---

## Q14: Generators

```javascript
function* gen() {
  yield 1;
  yield 2;
  return 3;
}
const it = gen();
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: true }
it.next(); // { value: undefined, done: true }

[...gen()]; // [1, 2] — spread only collects yielded values, NOT return value
```

---

## Q15: WeakMap vs Map

- **Map:** Strong reference to keys — objects used as keys are NEVER garbage collected while Map exists
- **WeakMap:** Weak reference to keys — if no other reference exists, key-value can be garbage collected
- **WeakMap use cases:** DOM element metadata, private class data, caching without memory leaks

---

## Q16: Advanced Event Loop

```javascript
console.log("start");
setTimeout(() => console.log("timeout1"), 0);
setTimeout(() => console.log("timeout2"), 0);
Promise.resolve()
  .then(() => {
    console.log("promise1");
    setTimeout(() => console.log("timeout3"), 0);
  })
  .then(() => console.log("promise2"));
console.log("end");

// Output: start, end, promise1, promise2, timeout1, timeout2, timeout3
```

**Tracing:** Sync: "start", "end". Microtasks drain: "promise1" (schedules timeout3), "promise2". Macrotasks in order: "timeout1", "timeout2", "timeout3" (scheduled later).

---

## Q17: typeof Quirks

```javascript
typeof undefined   // "undefined"
typeof null        // "object"     ← famous JS bug from 1995!
typeof NaN         // "number"     ← NaN IS a number type!
typeof []          // "object"     ← arrays ARE objects! Use Array.isArray()
typeof {}          // "object"
typeof function(){} // "function"
typeof ""          // "string"
typeof 42n         // "bigint"
```

---

## Q18: Promise Chain Error Recovery

```javascript
Promise.resolve(1)
  .then(x => x + 1)                    // 2
  .then(x => { throw new Error("fail"); }) // throws
  .then(x => x + 1)                    // SKIPPED
  .catch(e => {
    console.log(e.message);            // "fail"
    return 10;                         // catch RETURNS resolved promise
  })
  .then(x => console.log(x));         // 10 (chain continues normally)
```

**Key:** `catch` returns a **resolved** promise, so the chain continues after catch. This is how error recovery works.

---

## Q19: const, Object.freeze, and Shallow Freeze

```javascript
const obj = { a: 1, nested: { b: 2 } };
obj.a = 10;       // ✅ Works — const prevents reassignment, NOT mutation

const frozen = Object.freeze({ a: 1, nested: { b: 2 } });
frozen.a = 10;         // ❌ Silently fails (strict mode: TypeError)
console.log(frozen.a); // 1

frozen.nested.b = 20;         // ✅ Works! Freeze is SHALLOW
console.log(frozen.nested.b); // 20
```

---

## Q20: call vs apply vs bind

```javascript
function greet(greeting, punct) {
  return `${greeting}, ${this.name}${punct}`;
}
const person = { name: "Dharma" };

greet.call(person, "Hi", "!");         // "Hi, Dharma!" — args individually
greet.apply(person, ["Hello", "."]);   // "Hello, Dharma." — args as array
const bound = greet.bind(person, "Hey"); // Returns new function
bound("?");                             // "Hey, Dharma?" — partial application
```

| Method | Invokes? | Args | Use Case |
|--------|----------|------|----------|
| `call` | Yes, immediately | Individual | Known number of args |
| `apply` | Yes, immediately | Array | Unknown/spread args |
| `bind` | No, returns function | Partial | Event handlers, partial application |

---

# 14. PROMISES DEEP DIVE

## Q1: Three States of a Promise

```
pending ──→ fulfilled (resolved) — value is immutable
       └──→ rejected — reason is immutable

A promise settles ONCE. It can never go from fulfilled → rejected or vice versa.
```

---

## Q2: Promise Settles Once

```javascript
const p = new Promise((resolve, reject) => {
  resolve("A");   // This one takes effect
  resolve("B");   // Ignored
  reject("C");    // Ignored
});
p.then(console.log); // "A"
```

---

## Q3-Q5: Promise Chaining Fundamentals

Each `.then` returns a NEW promise. If `.then` returns a value, it's auto-wrapped in `Promise.resolve()`. If `.then` returns a Promise, the chain WAITS for it. Errors SKIP `.then` handlers until a `.catch` is found. `.catch` returns a **resolved** promise, so the chain continues.

---

## Q6: Implement Promise.all (Most Asked Polyfill!)

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    const total = promises.length;
    
    if (total === 0) return resolve([]);
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)       // Handle non-promise values
        .then(value => {
          results[index] = value;    // Maintain ORDER (not push!)
          completed++;
          if (completed === total) resolve(results);
        })
        .catch(reject);              // Fail fast on first error
    });
  });
}
```

**Critical details:**
1. `results[index]` NOT `results.push()` — maintains order regardless of completion order
2. `Promise.resolve(promise)` — handles non-promise values in the array
3. `.catch(reject)` — fail-fast on first rejection

---

## Q7: Implement Promise.race

```javascript
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      Promise.resolve(promise).then(resolve).catch(reject);
    });
    // First to settle wins. Subsequent resolve/reject calls are ignored.
  });
}
```

---

## Q8: Implement Promise.allSettled

```javascript
function promiseAllSettled(promises) {
  return new Promise(resolve => {
    const results = [];
    let completed = 0;
    const total = promises.length;
    
    if (total === 0) return resolve([]);
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => { results[index] = { status: "fulfilled", value }; })
        .catch(reason => { results[index] = { status: "rejected", reason }; })
        .finally(() => {
          completed++;
          if (completed === total) resolve(results);
        });
    });
  });
}
```

**Key difference from Promise.all:** NEVER rejects. Always resolves with array of result objects.

---

## Q9: async/await Error Handling

```javascript
async function getData() {
  try {
    const a = await Promise.resolve(1);     // a = 1
    const b = await Promise.reject("error");// THROWS — jumps to catch
    const c = await Promise.resolve(3);     // Never reached
    return a + b + c;
  } catch (e) {
    console.log("caught:", e);              // "caught: error"
    return -1;
  }
}
getData().then(console.log); // -1
```

`await` on a rejected promise THROWS the rejection reason. The function always returns a Promise (even `return -1` becomes `Promise.resolve(-1)`).

---

## Q10: Sequential vs Parallel Execution (CRITICAL!)

```javascript
// SEQUENTIAL — 3 seconds total (each waits for previous)
async function sequential() {
  const a = await fetch("/api/1"); // 1s
  const b = await fetch("/api/2"); // 1s (waits for a)
  const c = await fetch("/api/3"); // 1s (waits for b)
}

// PARALLEL — 1 second total (all run concurrently)
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetch("/api/1"), // 1s
    fetch("/api/2"), // 1s (concurrent)
    fetch("/api/3"), // 1s (concurrent)
  ]);
}
```

**Dashboard implication:** Fetching 5 independent widgets sequentially = 5s. Parallel = 1s. Use `Promise.all` when operations are independent.

---

## Q11: Promise.any

```javascript
Promise.any([reject("err1"), resolve("success"), reject("err2")])
  .then(console.log); // "success" — first FULFILLED promise wins

Promise.any([reject("err1"), reject("err2")])
  .catch(e => console.log(e.errors)); // ["err1", "err2"] — AggregateError
```

Use cases: try multiple CDN mirrors, fastest successful response, fallback patterns.

---

## Q12: The HARDEST Event Loop Question

```javascript
async function async1() {
  console.log("async1 start");      // 2. sync
  await async2();                    // 3. sync call to async2
  console.log("async1 end");        // 6. microtask (after await)
}
async function async2() {
  console.log("async2");            // 3. sync (before any await)
}
console.log("script start");        // 1. sync
setTimeout(() => console.log("setTimeout"), 0); // 8. macrotask
async1();                            // 2-3. called
new Promise(resolve => {
  console.log("promise1");          // 4. sync (constructor is sync!)
  resolve();
}).then(() => console.log("promise2")); // 7. microtask
console.log("script end");          // 5. sync

// Output: script start → async1 start → async2 → promise1 → script end → async1 end → promise2 → setTimeout
```

---

## Q13: Retry with Exponential Backoff

```javascript
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt); // 1s → 2s → 4s
      const jitter = delay * Math.random();            // Prevent thundering herd
      await new Promise(r => setTimeout(r, delay + jitter));
    }
  }
}
```

---

## Q14: Promise.withResolvers() (ES2024)

```javascript
const { promise, resolve, reject } = Promise.withResolvers();
// Cleaner API for creating externally-controllable promises
// No more awkward let-in-closure pattern

setTimeout(() => resolve("done"), 2000);
promise.then(console.log); // "done" after 2s
```

---

## Q15: Cancellable Fetch with AbortController

```javascript
function cancellableFetch(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("Timeout"), timeout);
  
  const promise = fetch(url, { signal: controller.signal })
    .then(res => { clearTimeout(timeoutId); return res.json(); })
    .catch(err => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Request timed out");
      throw err;
    });
  
  return { promise, cancel: () => controller.abort() };
}

// In React useEffect — CRITICAL pattern
useEffect(() => {
  const { promise, cancel } = cancellableFetch("/api/data");
  promise.then(setData).catch(setError);
  return () => cancel(); // Cleanup on unmount
}, []);
```

---

## Q16: Promise.finally

```javascript
fetchData()
  .then(data => console.log("data received"))
  .catch(err => console.log("error:", err.message))
  .finally(() => {
    loading = false; // Always runs — success or failure
    console.log("loading:", loading);
  });
// .finally() does NOT receive any arguments
// .finally() does NOT modify the chain's value (unless it throws)
```

---

# QUICK REVISION CHEAT SHEET

## Top 10 Things to Know Cold

1. **useCallback vs useMemo** — `useMemo` = cached value, `useCallback` = cached function reference. Only useful with `React.memo`.
2. **Server vs Client Components** — Default is Server. `'use client'` marks boundary. Client CAN receive Server as children.
3. **Next.js 15 Caching** — Uncached by default now. 4 layers. `revalidatePath`/`revalidateTag` for on-demand.
4. **State Classification** — Server (TanStack Query) / Global client (Zustand) / Local (useState) / URL (searchParams). Never put server data in global store.
5. **Core Web Vitals** — INP replaced FID (March 2024). LCP < 2.5s, INP < 200ms, CLS < 0.1.
6. **Discriminated Unions** — The TypeScript pattern for state machines. Exhaustive switch with `never` default.
7. **Event Loop** — Sync → ALL microtasks → ONE macrotask → repeat. Promise.then is microtask, setTimeout is macrotask.
8. **Stale Closure** — Use functional updates (`setCount(prev => prev + 1)`) or `useRef` to avoid.
9. **Promise.all vs allSettled** — `.all` fails fast. `.allSettled` waits for all. Use allSettled for batch operations.
10. **Error Boundaries + Suspense** — Per-widget isolation in dashboards. Error Boundary wraps Suspense wraps Widget.

---

*Last updated: March 2026 | Prepared for senior frontend interviews (6 YOE)*
