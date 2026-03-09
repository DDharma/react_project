"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const placeholderImg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0ea5e9"/>
        <stop offset="100%" stop-color="#0b1221"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="#0b1221"/>
    <rect x="20" y="20" width="760" height="410" rx="28" fill="url(#g)" opacity="0.9"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#e0f2fe" font-size="42" font-family="Inter, system-ui, -apple-system, sans-serif">Live Stream</text>
  </svg>
`);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const page = () => {
  const [seconds, setSeconds] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Start the live timer from 0.
  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setInput("");
    setError("");
    setEditingId(null);
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const value = input.trim();
      if (!value) {
        setError("Comment cannot be empty.");
        return;
      }
      if (value.length > 140) {
        setError("Keep it under 140 characters.");
        return;
      }

      if (editingId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === editingId ? { ...c, text: value, edited: true } : c
          )
        );
        resetForm();
        return;
      }

      const newComment = {
        id: crypto.randomUUID(),
        text: value,
        at: seconds,
        edited: false,
      };
      setComments((prev) => [...prev, newComment]);
      resetForm();
    },
    [editingId, input, seconds]
  );

  const handleEdit = useCallback((comment) => {
    setEditingId(comment.id);
    setInput(comment.text);
    setError("");
  }, []);

  const handleDelete = useCallback((id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) {
      resetForm();
    }
  }, [editingId]);

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => a.at - b.at),
    [comments]
  );

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-8">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/40">
            <img
              src={placeholderImg}
              alt="Live stream placeholder"
              className="w-full h-auto"
            />
            <div className="absolute top-4 left-4 flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full bg-red-600 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-lg shadow-red-900/50">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Live
              </span>
              <span className="rounded-full bg-black/50 text-white/90 px-3 py-1 text-xs font-semibold">
                {formatTime(seconds)}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <h2 className="text-white text-lg font-semibold mb-3">
            Chat stream
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 mb-4"
          >
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              maxLength={200}
              className="w-full rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Say something nice..."
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-lg bg-cyan-600 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-cyan-900/40 transition hover:-translate-y-0.5 hover:shadow-cyan-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b1221]"
              >
                {editingId ? "Save edit" : "Send"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/20 text-white/80 px-3 py-2 text-sm hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg shadow-black/30 max-h-[500px] overflow-y-auto divide-y divide-white/10">
            {sortedComments.length === 0 ? (
              <div className="p-4 text-white/60 text-sm">
                No comments yet. Be the first to say hi.
              </div>
            ) : (
              sortedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-xs text-white/50 flex items-center gap-2">
                      <span>{formatTime(comment.at)}</span>
                      {comment.edited && (
                        <span className="text-white/40">(edited)</span>
                      )}
                    </div>
                    <p className="text-sm text-white mt-1 break-words">
                      {comment.text}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="text-cyan-300 hover:text-cyan-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-300 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
