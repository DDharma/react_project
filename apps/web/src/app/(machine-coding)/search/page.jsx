"use client";
import React, { useEffect, useState } from "react";
//   const [search, setSearch] = useState("");
//   const [searchResult, setSearchResult] = useState([]);

//   const handleChange = (e) => {
//     setSearch(e.target.value);
//   };

//   const handleSearch = async () => {
//     fetch(`https://dummyjson.com/posts/search?q=${search}&limit=5`).then(
//       (res) => {
//         res.json().then((data) => {
//           setSearchResult(data.posts);
//         });
//       }
//     );
//   };

//   useEffect(() => {
//     if (search.length === 0) {
//       setSearchResult([]);
//       return;
//     }

//     const timeOut = setTimeout(() => {
//       handleSearch();
//     }, 500);

//     return () => clearTimeout(timeOut);
//   }, [search]);

//   function highlightMatch(text, query) {
//     if (!query) return text;

//     const regex = new RegExp(`(${query})`, "ig"); // case-insensitive
//     const parts = text.split(regex); // split keeps matched parts

//     return parts.map((part, index) =>
//       part.toLowerCase() === query.toLowerCase() ? (
//         <strong key={index}>{part}</strong>
//       ) : (
//         <span key={index}>{part}</span>
//       )
//     );
//   }

//   return (
//     <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
//       <div className="text-center space-y-1">
//         <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
//           Search Auto-Complete
//         </p>
//         <p className="text-white/70 text-sm"></p>
//       </div>
//       <div className="w-full max-w-md flex flex-col items-center justify-center gap-2">
//         <input
//           className="h-10 w-80 bg-white text-black px-2 py-2 rounded"
//           type="text"
//           value={search}
//           onChange={handleChange}
//           placeholder="Search"
//         />
//         {searchResult.length > 0 && (
//           <div className="w-80 text-black h-fit bg-white rounded px-2 py-2">
//             {searchResult.map((d, idx) => {
//               return (
//                 <div className="text-8" key={idx}>
//                   {highlightMatch(d.title, search)}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default page;

// Basic Search with 300ml debounce

const limit = 20;
const page = 3;

const SearchAutocomplete = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [selected, setSelected] = useState({});
  const [activeIndex, setActiveIndex] = useState(3);
  const [activeCounter, setActiveCounter] = useState(0);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSelect = (item) => {
    setSelected(item);
  };

  const handleSearch = async (search) => {
    setActiveIndex(-1);
    fetch(
      `https://dummyjson.com/posts/search?q=${search}&limit=${limit}&page=${page}`,
    ).then((res) => {
      setSearchResult([]);
      res.json().then((data) => {
        setSearchResult(data.posts);
        handleSelect({});
      });
    });
  };

  useEffect(() => {
    if (search.length === 0) {
      setSearchResult([]);
      handleSelect({});
      return;
    }
    const timeOut = setTimeout(() => {
      handleSearch(search);
    }, 300);
    return () => clearTimeout(timeOut);
  }, [search]);

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "ig"); // case-insensitive
    const parts = text.split(regex); // split keeps matched parts
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (searchResult.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          // If nothing is selected (-1) or we are at the end, go to 0
          if (prev === -1 || prev === searchResult.length - 1) return 0;
          return prev + 1;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          // If nothing is selected or we are at the start, go to the last item
          if (prev <= 0) return searchResult.length - 1;
          return prev - 1;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        // Use activeIndex to select the correct item from the list
        if (activeIndex >= 0 && activeIndex < searchResult.length) {
          handleSelect(searchResult[activeIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setActiveIndex(-1);
        // Optional: close the dropdown here
      }
    };

    // 2. Attach the listener
    document.addEventListener("keydown", handleKeyDown);

    // 3. Clean up correctly by passing the same function reference
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchResult.length, selected]); // Update dependencies if these values change

  console.log("searchResult", searchResult, activeIndex, selected);

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-2">
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
      </div>
      {searchResult.length > 0 && (
        <div className="w-80 text-black h-fit bg-white rounded px-2 py-2 max-h-60 overflow-y-auto">
          {searchResult.map((d, idx) => {
            console.log("activeIndex", activeIndex, d.id);
            return (
              <div
                onClick={() => handleSelect(d)}
                className={`text-8 my-2 py-1 px-2 ${
                  selected.id == d.id || activeIndex == idx
                    ? "bg-cyan-300 text-black rounded-md"
                    : "bg-gray-200" // Move it here
                }`}
                key={d.id}
              >
                {highlightMatch(d.title, search)}
              </div>
            );
          })}
        </div>
      )}
      {selected.id && (
        <div className="w-[800px] text-black h-fit bg-white rounded px-2 py-2 max-h-60 overflow-y-auto mt-10">
          <div className="text-8 my-2 py-1 bg-gray-200 px-2" key={selected.id}>
            <p className="font-bold">{selected.title}</p>
            <p>{selected.body}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
