"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COMMENTS_PER_PAGE = 10;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const Page = () => {
  const [seconds, setSeconds] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);

  const chatContainerRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setInput("");
    setError("");
    setEditingId(null);
  };

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => a.at - b.at),
    [comments]
  );

  const totalComments = sortedComments.length;
  const hasMore = visibleCount < totalComments;

  // Show the latest `visibleCount` comments (slice from end)
  const visibleComments = useMemo(() => {
    const start = Math.max(0, totalComments - visibleCount);
    return sortedComments.slice(start);
  }, [sortedComments, visibleCount, totalComments]);

  // Auto-scroll to bottom of chat container when new comment added
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || !shouldAutoScroll.current) return;
    container.scrollTop = container.scrollHeight;
  }, [sortedComments]);

  // Load older comments when user scrolls to top
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Near top — load more
    if (scrollTop < 40 && hasMore) {
      const prevHeight = scrollHeight;
      setVisibleCount((prev) => Math.min(prev + COMMENTS_PER_PAGE, totalComments));
      // Preserve scroll position after loading older comments
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - prevHeight;
        }
      });
    }

    // Track if user is near bottom (auto-scroll on new messages)
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 60;
  }, [hasMore, totalComments]);

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

      shouldAutoScroll.current = true;
      const newComment = {
        id: crypto.randomUUID(),
        text: value,
        at: seconds,
        edited: false,
      };
      setComments((prev) => [...prev, newComment]);
      setVisibleCount((prev) => prev + 1);
      resetForm();
    },
    [editingId, input, seconds]
  );

  const handleEdit = useCallback((comment) => {
    setEditingId(comment.id);
    setInput(comment.text);
    setError("");
  }, []);

  const handleDelete = useCallback(
    (id) => {
      setComments((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
    },
    [editingId]
  );

  return (
    <div className="flex flex-col items-center bg-[#0a0a0f] min-h-screen w-full p-6 md:p-10">
      {/* Header */}
      <div className="w-full max-w-5xl mb-6">
        <h1 className="text-2xl font-bold text-white/90 tracking-tight">
          Live Stream
        </h1>
        <p className="text-sm text-white/40 mt-1">Watch and chat in real time</p>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
        {/* Video player */}
        <div className="w-full lg:w-[62%]">
          <div className="relative overflow-hidden rounded-xl bg-[#12121a] border border-white/[0.06]">
            <div className="aspect-video bg-gradient-to-br from-[#1a1a2e] via-[#12121a] to-[#0a0a14] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white/20 text-sm font-medium">Live Stream</p>
              </div>
            </div>

            {/* Live badge + timer */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-red-600/90 text-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
              <span className="rounded-md bg-black/60 text-white/80 px-2.5 py-1 text-[11px] font-mono font-medium backdrop-blur-sm">
                {formatTime(seconds)}
              </span>
            </div>

            {/* Viewer count */}
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-black/60 text-white/60 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                {comments.length} messages
              </span>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className="w-full lg:w-[38%] flex flex-col bg-[#12121a] rounded-xl border border-white/[0.06] overflow-hidden">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Live Chat</h2>
            <span className="text-[11px] text-white/30 font-medium">
              {totalComments} total
            </span>
          </div>

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5"
            style={{ maxHeight: "420px", minHeight: "300px" }}
          >
            {/* Load more indicator */}
            {hasMore && (
              <div className="text-center py-3">
                <span className="text-[11px] text-white/25 font-medium">
                  Scroll up for older messages
                </span>
              </div>
            )}

            {visibleComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white/15" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                </div>
                <p className="text-white/25 text-xs">No messages yet</p>
                <p className="text-white/15 text-[11px] mt-1">Be the first to chat</p>
              </div>
            ) : (
              visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className="group rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-white/70">U</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-violet-300/80">User</span>
                        <span className="text-[10px] text-white/20 font-mono">
                          {formatTime(comment.at)}
                        </span>
                        {comment.edited && (
                          <span className="text-[10px] text-white/15">(edited)</span>
                        )}
                      </div>
                      <p className="text-[13px] text-white/70 leading-relaxed break-words mt-0.5">
                        {comment.text}
                      </p>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="p-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400/80 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-white/[0.06] p-3">
            {editingId && (
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] text-violet-300/60 font-medium">Editing message</span>
                <button
                  onClick={resetForm}
                  className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {error && (
              <p className="text-[11px] text-red-400/80 mb-2 px-1">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={1}
                maxLength={140}
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[13px] text-white/80 placeholder-white/20 px-3 py-2.5 resize-none focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-colors"
                placeholder="Send a message..."
              />
              <button
                type="submit"
                className="rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white px-4 py-2.5 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-1 focus:ring-offset-[#12121a] flex-shrink-0"
              >
                {editingId ? "Save" : "Chat"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
