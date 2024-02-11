"use client";
import React, { useEffect, useRef, useState } from "react";

const Steper = ({ stepData = [] }) => {
  const [current, setCurrent] = useState(1);
  const [manggin, setMargin] = useState({
    ml: 0,
    mr: 0,
  });
  const stepRef = useRef([]);

  const handleNext = () => {
    setCurrent(current + 1);
  };

  const calculateWidth = () => {
    if (current <= stepData.length) {
      return ((current - 1) / (stepData.length - 1)) * 100;
    }
  };

  useEffect(() => {
    setMargin({
      ml: stepRef.current[0].offsetWidth/2,
      mr: stepRef.current[3].offsetWidth/2,
    });
  }, [stepRef]);

  console.log("current", manggin);

  return (
    <>
      <div className="mx-[30px] relative">
        {stepData.length > 0 ? (
          <div className="flex justify-between">
            {stepData.map((data, idx) => {
              return (
                <div
                  ref={(rf) => (stepRef.current[idx] = rf)}
                  className="flex flex-col items-center justify-center"
                  key={data.id}
                >
                  <div
                    className={`w-[40px] h-[40px] rounded-[20px] flex items-center justify-center text-[20px] ${
                      current === idx + 1 ? "bg-[#46b7da]" : "bg-gray-500"
                    } ${idx + 1 < current ? "bg-[#3ea73e]" : ""}`}
                  >
                    {idx}
                  </div>
                  <div className="text-[18px] capitalize font-bold mt-[5px]">
                    {data.name}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>no data</div>
        )}
        <div
          style={{
            width:`calc(100% - (${manggin.ml + manggin.mr}px))`,
            marginLeft:manggin.mr,
            // marginRight:manggin.mr
          }}
          className={`bg-gray-300 h-[5px] absolute top-[25%] left-0 z-[-1] `}
        >
          <div
            style={{
              width: `${calculateWidth()}%`,
            }}
            className="bg-green-300 h-full"
          ></div>
        </div>
      </div>

      <div className="flex justify-center mt-[50px]">
        {current <= 4 ? (
          <button
            onClick={handleNext}
            className="border-[1px] border-black px-[12px] py-[4px] rounded font-bold font-mono"
          >
            {current === stepData.length ? (
              <span>finish</span>
            ) : (
              <span>next &gt;</span>
            )}
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Steper;
