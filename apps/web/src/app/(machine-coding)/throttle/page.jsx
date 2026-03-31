'use client'
import { useRef, useState } from "react"

// Throttle function - runs fn at most once every `delay` ms
function throttle(fn, delay) {
  let lastCall = 0
  let timer = null

  return function (...args) {
    const now = Date.now()
    const remaining = delay - (now - lastCall)

    if (remaining <= 0) {
      clearTimeout(timer)
      timer = null
      lastCall = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now()
        timer = null
        fn(...args)
      }, remaining)
    }
  }
}

export default function ThrottlePage() {
  const [query, setQuery] = useState("")
  const [logs, setLogs] = useState([])
  const [keystrokes, setKeystrokes] = useState(0)

  const fakeApiCall = (term) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, { term, time, id: Date.now() }])
  }

  const throttledApi = useRef(throttle(fakeApiCall, 1000)).current

  const handleChange = (e) => {
    setQuery(e.target.value)
    setKeystrokes((c) => c + 1)
    throttledApi(e.target.value)
  }

  return (
    <div style={{
      padding: 30,
      maxWidth: 600,
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      fontFamily: "system-ui, sans-serif",
    }}>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>Throttle - Search Input</h2>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type to search..."
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          borderRadius: 8,
          border: "1px solid #334155",
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <div style={{
        display: "flex",
        gap: 20,
        marginBottom: 16,
        fontSize: 14,
        color: "#94a3b8",
      }}>
        <span>Keystrokes: <b style={{ color: "#e2e8f0" }}>{keystrokes}</b></span>
        <span>API Calls: <b style={{ color: "#60a5fa" }}>{logs.length}</b></span>
        <span>Saved: <b style={{ color: "#4ade80" }}>{keystrokes - logs.length}</b></span>
      </div>

      <ul style={{
        listStyle: "none",
        padding: 12,
        margin: 0,
        backgroundColor: "#1e293b",
        borderRadius: 8,
        border: "1px solid #334155",
        maxHeight: 300,
        overflowY: "auto",
      }}>
        {logs.length === 0 && (
          <li style={{ color: "#475569", fontSize: 14 }}>Logs will appear here...</li>
        )}
        {logs.map((log) => (
          <li key={log.id} style={{
            padding: "6px 0",
            borderBottom: "1px solid #334155",
            fontSize: 14,
          }}>
            <span style={{ color: "#60a5fa", fontFamily: "monospace", marginRight: 10 }}>
              {log.time}
            </span>
            &quot;{log.term}&quot;
          </li>
        ))}
      </ul>
    </div>
  )
}
