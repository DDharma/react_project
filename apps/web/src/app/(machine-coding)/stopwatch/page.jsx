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
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Stopwatch lab
        </p>
        <h1 className="text-4xl font-bold text-white">Analog + Digital</h1>
        <p className="text-white/70 text-sm">
          Start, stop, reset, and save laps while watching the clock hands move.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="flex justify-center items-center">
          <div className="relative w-56 h-56 rounded-full border-4 border-white/15 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-black/40">
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs uppercase tracking-[0.3em]">
              Timer
            </div>
            <div
              className="absolute top-[68px] left-1/2 h-16 w-1 bg-white origin-bottom rounded-full"
              style={{ transform: `translateX(-50%) rotate(${hoursAngle}deg)` }}
            />
            <div
              className="absolute top-[52px] left-1/2 h-20 w-0.5 bg-cyan-200 origin-bottom rounded-full"
              style={{ transform: `translateX(-50%) rotate(${minutesAngle}deg)` }}
            />
            <div
              className="absolute top-[44px] left-1/2 h-24 w-0.5 bg-cyan-400 origin-bottom rounded-full"
              style={{ transform: `translateX(-50%) rotate(${secondsAngle}deg)` }}
            />
            <div className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -mt-[7px] -ml-[7px] rounded-full bg-white shadow" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 text-white p-6 shadow-xl shadow-black/40">
            <div className="text-sm text-white/60 uppercase tracking-wide">
              Elapsed time
            </div>
            <div className="text-5xl font-mono font-bold mt-2">{currentLabel}</div>
          </div>

          <div className="control flex flex-wrap justify-start items-center gap-3">
            {controls.map((data, idx) => (
              <button
                onClick={() => {
                  clockControls(data);
                }}
                key={idx}
                className="rounded-full px-4 py-2.5 bg-cyan-600 text-white uppercase text-xs font-semibold shadow-lg shadow-cyan-900/30 border border-white/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-cyan-900/50 hover:border-white/25 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b1221]"
              >
                {data}
              </button>
            ))}
          </div>

          <div className="data grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedTimes?.length > 0 ? (
              savedTimes.map((d, idx) => {
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-white/90 border border-white/10 rounded-xl px-4 py-3 bg-white/5"
                  >
                    <span className="text-sm">Lap {idx + 1}</span>
                    <span className="font-mono font-semibold">{d}</span>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-white/60 text-sm">
                No saved laps yet. Hit <span className="font-semibold text-white">save</span> to record one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
