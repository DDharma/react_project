"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

const page = () => {
  const [paginatedResult, setPaginatedResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const scrollRef = useRef(null);

  const fetchPost = async () => {
    setLoading(true);
    fetch(
      `https://dummyjson.com/posts?limit=${limit}&skip=${pageNumber * limit}`
    ).then((res) => {
      res.json().then((data) => {
        setPaginatedResult([...paginatedResult, ...data.posts]);
        setHasMore((data.posts || []).length === limit);
         setLoading(false);
      });
    });
  };

  useEffect(() => {
    fetchPost();
  }, [pageNumber]);

  const handleScroll = () => {
    setPageNumber((prev) => prev + 1);
  };

  const cards = useMemo(
    () =>
      paginatedResult &&
      paginatedResult?.length > 0 &&
      paginatedResult?.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 space-y-3"
        >
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Post #{post.id}</span>
            <span>
              {post.tags
                ?.slice(0, 2)
                ?.map((t) => `#${t}`)
                .join(" · ")}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-white">{post.title}</h2>
          <p className="text-white/70 text-sm line-clamp-3">{post.body}</p>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span>👍 {post.reactions?.likes ?? 0}</span>
            <span>👎 {post.reactions?.dislikes ?? 0}</span>
            <span>👁️ {post.views ?? "–"}</span>
          </div>
        </article>
      )),
    [paginatedResult]
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPageNumber((prev) => prev + 1);
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 }
    );
    io.observe(scrollRef.current);
    return () => io.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Infinite Scroll
        </p>
        <p className="text-white/70 text-sm">Scroll To Load More</p>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 gap-5">{cards}</div>
       {loading && <div className="text-white/70 text-sm">Loading...</div>}
      {!hasMore && !loading && (
        <div className="text-white/50 text-sm">No more posts to load.</div>
      )}
       <div ref={scrollRef} className="h-1 w-full" aria-hidden />
    </div>
  );
};

export default page;
