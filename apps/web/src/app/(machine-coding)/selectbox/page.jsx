'use client'
import React, { useCallback, useMemo, useState } from "react";

const page = () => {
  const items = useMemo(
    () => [
      "Alpha",
      "Bravo",
      "Charlie",
      "Delta",
      "Echo",
      "Foxtrot",
      "Golf",
      "Hotel",
      "India",
      "Juliet",
    ],
    []
  );

  const [selected, setSelected] = useState([]);
  const [anchor, setAnchor] = useState(null); // last clicked index for range selection

  const handleItemClick = useCallback(
    (index, event) => {
      const isToggle = event.metaKey || event.ctrlKey;
      const isRange = event.shiftKey;

      setSelected((prev) => {
        const prevSet = new Set(prev);

        if (isRange && anchor !== null) {
          // Add range without clearing existing selection.
          const start = Math.min(anchor, index);
          const end = Math.max(anchor, index);
          for (let i = start; i <= end; i += 1) {
            prevSet.add(i);
          }
          return Array.from(prevSet).sort((a, b) => a - b);
        }

        if (isToggle) {
          if (prevSet.has(index)) {
            prevSet.delete(index);
          } else {
            prevSet.add(index);
          }
          return Array.from(prevSet).sort((a, b) => a - b);
        }

        // Plain click: single select, clear others.
        return [index];
      });

      setAnchor(index);
    },
    [anchor]
  );

  const isSelected = useCallback(
    (idx) => selected.includes(idx),
    [selected]
  );

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Select Box
        </p>
        <p className="text-white/70 text-sm">
          Click = single, Cmd/Ctrl+Click = toggle, Cmd/Ctrl+Shift+Click = add range.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl shadow-lg shadow-black/40 divide-y divide-white/10">
        {items.map((label, idx) => {
          const active = isSelected(idx);
          return (
            <label
              key={label}
              className={`flex items-center justify-between px-5 py-3 cursor-pointer transition ${
                active ? "bg-cyan-500/15" : "hover:bg-white/5"
              }`}
              onClick={(e) => handleItemClick(idx, e)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  readOnly
                  checked={active}
                  className="h-4 w-4 rounded border-white/30 text-cyan-500 bg-transparent"
                />
                <span className="text-white">{label}</span>
              </div>
              <span className="text-xs text-white/50">#{idx + 1}</span>
            </label>
          );
        })}
      </div>

      <div className="text-white/70 text-sm">
        Selected: {selected.length ? selected.map((i) => items[i]).join(", ") : "none"}
      </div>
    </div>
  );
};

export default page;
