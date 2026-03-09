"use client";
import React, { useState } from "react";

const page = () => {
  const [textData, setTextData] = useState([]);

  const onChangeText = (id) => {
    console.log(id);
  };

  const findValue = (id) => {
    const val = textData.filter((d) => d.id === id);
    return val;
  };

  const addNewInput = () => {
    setTextData((prev) => {
      return [...prev, { id: prev.length + 1, data: "" }];
    });
  };

  const Textbox = ({ id }) => {
    return (
      <input
        type="text"
        value={() => findValue(id)}
        onChange={() => onChangeText(id)}
        className="h-10 w-[300px] text-black bg-white/90 "
      />
    );
  };

  console.log("textData", textData);

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Text Box
        </p>
      </div>
      <div className="flex justify-between items-center gap-2">
        <button
          onClick={() => addNewInput()}
          className="rounded-full px-4 py-2.5 bg-cyan-600 text-white uppercase text-xs font-semibold shadow-lg shadow-cyan-900/30 border border-white/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-cyan-900/50 hover:border-white/25 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b1221]"
        >
          add
        </button>
        <button className="rounded-full px-4 py-2.5 bg-cyan-600 text-white uppercase text-xs font-semibold shadow-lg shadow-cyan-900/30 border border-white/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-cyan-900/50 hover:border-white/25 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b1221]">
          Submit
        </button>
      </div>
      <div>
        {textData &&
          textData.length > 0 &&
          textData.map((d) => {
            return (
              <div key={d.id}>
                <Textbox id={d.id} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default page;
