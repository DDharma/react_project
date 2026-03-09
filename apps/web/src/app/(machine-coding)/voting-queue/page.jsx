"use client";
import { setDate } from "date-fns/fp";
import React, { useEffect, useMemo, useState } from "react";

const apiQuestion = [
  {
    id: 1,
    question:
      "How satisfied are you with the current system? How satisfied are you with the current system? How satisfied are you with the current system? How satisfied are you with the current system?",
    rating: 0,
  },
  {
    id: 2,
    question: "Do you support the proposed changes?",
    rating: 0,
  },
  {
    id: 3,
    question: "Should the voting process be fully digital?",
    rating: 0,
  },
  {
    id: 4,
    question: "Is the voting system easy to use?",
    rating: 0,
  },
  {
    id: 5,
    question: "Do you trust the security of the voting system?",
    rating: 0,
  },
  {
    id: 6,
    question: "Should voting be available on mobile devices?",
    rating: 0,
  },
  {
    id: 7,
    question: "Is voter identity verification sufficient?",
    rating: 0,
  },
  {
    id: 8,
    question: "Should voting results be visible in real time?",
    rating: 0,
  },
  {
    id: 9,
    question: "Do you think the voting system is fair to all users?",
    rating: 0,
  },
  {
    id: 10,
    question: "Would you recommend this voting system to others?",
    rating: 0,
  },
];

const rate = [1, 2, 3, 4, 5];
const page = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const data = localStorage.getItem("questions");

    if (!data || data === "undefined") {
      setQuestions(apiQuestion);
      localStorage.setItem("questions", JSON.stringify(apiQuestion));
      setLoading(false);
      return;
    }

    try {
      setQuestions(JSON.parse(data));
      setLoading(false);
    } catch {
      setQuestions(apiQuestion);
      localStorage.setItem("questions", JSON.stringify(apiQuestion));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (questions) {
      localStorage.setItem("questions", JSON.stringify(questions));
    }
  }, [questions]);

  const handleRating = (rating, id) => {
    if (!questions) return;

    setQuestions((prev) =>
      (prev ?? []).map((item) =>
        item.id === id ? { ...item, rating: rating } : item
      )
    );
  };

  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          Voting System
        </p>
        <p className="text-white/70 text-sm"></p>
      </div>
      {loading ? (
        <div>
          <div className="flex items-center justify-between text-white/70 text-sm mb-3 py-2 bg-gradient-to-br from-white/10 to-white/5"></div>
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-black/40 space-y-6 pb-16 w-[600px] flex-wrap"></div>
          <div className="flex justify-center items-center mt-6 gap-5">
            <div
              className="px-5 py-2 rounded-lg border border-white/20 text-white/80
               hover:bg-white/10 hover:text-white
               transition-all duration-200 !w-10 h-6"
            ></div>

            <div
              className="px-6 py-2 rounded-lg bg-blue-600 text-white
               hover:bg-blue-700 shadow-lg shadow-blue-600/30
               transition-all duration-200 !w-10 h-6"
            ></div>
          </div>
        </div>
      ) : (
        <>
          {" "}
          <div className="flex items-center justify-between text-white/70 text-sm mb-3">
            <span>
              Question {currentQuestion + 1} of {questions?.length}
            </span>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-xl shadow-black/40 space-y-6 pb-16 w-[600px] flex-wrap">
            <h2 className="text-2xl font-semibold text-white leading-relaxed">
              {questions?.[currentQuestion]?.question}
            </h2>

            {/* Rating */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              {rate?.map((data, idx) => {
                return (
                  <div
                    onClick={() =>
                      handleRating(data, questions?.[currentQuestion]?.id)
                    }
                    key={idx}
                    className={`w-9 h-9 flex items-center justify-center rounded-full
                    text-white font-medium
                   hover:bg-blue-500 hover:scale-110
                   transition-all duration-200 cursor-pointer ${
                     questions?.[currentQuestion]?.rating === data
                       ? "bg-blue-500"
                       : "bg-white/10"
                   }`}
                  >
                    {data}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Navigation */}
          <div className="flex justify-center items-center mt-6 gap-5">
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="px-5 py-2 rounded-lg border border-white/20 text-white/80
               hover:bg-white/10 hover:text-white
               transition-all duration-200"
            >
              ← Prev
            </button>

            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={currentQuestion === questions?.length - 1}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white
               hover:bg-blue-700 shadow-lg shadow-blue-600/30
               transition-all duration-200"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default page;
