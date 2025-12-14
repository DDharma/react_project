"use client";
import React, { useEffect, useState } from "react";

const page = () => {
  const controls = ["start", "stop", "reset", "save"];
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [savedTimes, setSavedTimes] = useState([]);

  // Convert total seconds into hh:mm:ss for display.
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return { hours, minutes, seconds, label: `${hours}:${minutes}:${seconds}` };
  };

  // Run/stop the ticking interval based on `running`.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  // Handle control actions.
  const clockControls = (action) => {
    switch (action) {
      case "start":
        setRunning(true);
        break;
      case "stop":
        setRunning(false);
        break;
      case "reset":
        setRunning(false);
        setElapsedSeconds(0);
        setSavedTimes([]);
        break;
      case "save": {
        const { label } = formatTime(elapsedSeconds);
        setSavedTimes((prev) => [...prev, label]);
        break;
      }
      default:
        break;
    }
  };

  const { hours, minutes, seconds, label: currentLabel } = formatTime(elapsedSeconds);
  // Angles for analog clock hands based on elapsed stopwatch time.
  const secondsAngle = (elapsedSeconds % 60) * 6; // 360deg / 60s
  const minutesAngle = ((elapsedSeconds / 60) % 60) * 6 + secondsAngle / 60; // minute hand creeps with seconds
  const hoursAngle = ((elapsedSeconds / 3600) % 12) * 30 + minutesAngle / 12; // 360deg / 12h with minute offset

  return (
    <div className="flex flex-col justify-start items-center bg-gray-700 w-full h-screen p-8">
      <div className="clock flex justify-between items-center w-full">
        <div className="flex justify-center items-center w-1/2">
          <div className="relative w-48 h-48 rounded-full border-4 border-white/20 bg-gray-800/70 shadow-inner shadow-black/40">
            <div className="absolute inset-3 rounded-full border border-white/10" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs uppercase tracking-widest">
              Stopwatch
            </div>
            <div
              className="absolute top-4 left-1/2 h-20 w-0.5 bg-white origin-bottom rounded-full"
              style={{ transform: `translateX(-50%) rotate(${hoursAngle}deg)` }}
            />
            <div
              className="absolute top-3 left-1/2 h-22 w-0.5 bg-cyan-200 origin-bottom rounded-full"
              style={{ transform: `translateX(-50%) rotate(${minutesAngle}deg)` }}
            />
            <div
              className="absolute top-2 left-1/2 h-24 w-0.5 bg-cyan-400 origin-bottom rounded-full"
              style={{ transform: `translateX(-50%) rotate(${secondsAngle}deg)` }}
            />
            <div className="absolute top-1/2 left-1/2 h-3 w-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow" />
          </div>
        </div>
        <div className="flex justify-center items-center w-1/2 text-white">
          {currentLabel}
        </div>
      </div>
      <div className="control flex justify-center items-center gap-3 w-fit py-4 px-8">
        {controls.map((data, idx) => (
          <button
            onClick={() => {
              clockControls(data);
            }}
            key={idx}
            className="rounded-full px-4 py-2 bg-cyan-600 text-white uppercase text-xs font-semibold shadow-lg shadow-cyan-900/25 border border-white/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-cyan-900/40 hover:border-white/25 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-gray-700"
          >
            {data}
          </button>
        ))}
      </div>
      <div className="data grid grid-cols-2 gap-4 w-full">
        {savedTimes?.length > 0 &&
          savedTimes.map((d, idx) => {
            return (
              <div key={idx} className="text-white/80 border border-white/10 rounded-md px-3 py-2">
                {d}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default page;
