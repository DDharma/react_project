"use client";
import { INITIAL_STATE, reducer } from "@/utils/reducers/vottingReduce";
import React, { useReducer } from "react";


const page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const stateArr = Object.keys(state);

  const vote = (name) => {
    dispatch({
      name: name,
      vote: true,
      time: new Date().toLocaleString(), // human-readable timestamp
      type: "INCREMENT",
    });
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 min-h-screen w-full p-10 gap-10">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">
          Framework showdown
        </p>
        <h1 className="text-3xl font-bold text-white mt-2">Cast your vote</h1>
        <p className="text-white/60 text-sm mt-1">
          Tap the 👍 to boost your favorite. Latest vote time shown below each card.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {stateArr?.length > 0 &&
          stateArr.map((data, idx) => {
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 shadow-xl shadow-black/40 p-6 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-white text-xl font-semibold capitalize">
                    {data}
                  </div>
                  <button
                    onClick={() => vote(data)}
                    className="flex items-center gap-2 rounded-full bg-cyan-600 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-cyan-900/40 transition hover:-translate-y-0.5 hover:shadow-cyan-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    <span role="img" aria-label="thumbs up">
                      👍
                    </span>
                    Vote
                  </button>
                </div>

                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold text-white">
                    {state?.[data]?.voteCount}
                  </div>
                  <div className="text-white/50 text-sm mb-1">votes</div>
                </div>

                <div className="text-white/60 text-xs border-t border-white/10 pt-3">
                  {state?.[data]?.time
                    ? `Last vote: ${state?.[data]?.time}`
                    : "No votes yet"}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default page;
