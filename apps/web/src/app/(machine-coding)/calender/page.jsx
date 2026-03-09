import { format } from "date-fns";
import React from "react";

const monthsWithDays = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

const page = () => {
  const currentMonths = format(new Date(), "MM");
  const toDaysDate = format(new Date(), "dd");
  const currentTime = format(new Date(), "hh:mm");

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Event Calendar
        </p>
        <p className="text-white/70 text-sm">Add, Edit and Delete Events</p>
      </div>
      <div className="text-white">
        {toDaysDate},{currentMonths} :{currentTime}
      </div>
    </div>
  );
};

export default page;
