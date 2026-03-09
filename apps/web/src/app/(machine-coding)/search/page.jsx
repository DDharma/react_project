"use client";
import React, { useEffect, useState } from "react";

const page = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = async () => {
    fetch(`https://dummyjson.com/posts/search?q=${search}&limit=5`).then(
      (res) => {
        res.json().then((data) => {
          setSearchResult(data.posts);
        });
      }
    );
  };

  useEffect(() => {
    if (search.length === 0) {
      setSearchResult([]);
      return;
    }

    const timeOut = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeOut);
  }, [search]);

  function highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "ig"); // case-insensitive
    const parts = text.split(regex); // split keeps matched parts

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Search Auto-Complete
        </p>
        <p className="text-white/70 text-sm"></p>
      </div>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-2">
        <input
          className="h-10 w-80 bg-white text-black px-2 py-2 rounded"
          type="text"
          value={search}
          onChange={handleChange}
          placeholder="Search"
        />
        {searchResult.length > 0 && (
          <div className="w-80 text-black h-fit bg-white rounded px-2 py-2">
            {searchResult.map((d, idx) => {
              return (
                <div className="text-8" key={idx}>
                  {highlightMatch(d.title, search)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
