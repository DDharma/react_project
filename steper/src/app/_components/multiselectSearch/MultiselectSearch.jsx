"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
const apiUrl = "https://dummyjson.com/users/search?q=";

const MultiselectSearch = () => {
  const [nameInput, setNameInput] = useState();
  const [suggestionNames, setSuggestionNames] = useState([]);
  const [selectedName, setSelectedName] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (nameInput?.trim() === "") {
        setSuggestionNames([]);
        return;
      }
      const searchUrl = apiUrl + nameInput;
      await axios.get(searchUrl).then((res) => {
        if (res?.status === 200) {
          setSuggestionNames(res?.data?.users);
          console.log("data",suggestionNames)
        //   const removeNames = suggestionNames.filter(item => !selectedName.includes(item))
        //   setSuggestionNames(removeNames)
        //   console.log("hello",removeNames,selectedName)
          

        }
      });
    };
    fetchUser();
  }, [nameInput]);

  const handelSelectedUser = (name) => {
    setSelectedName([...selectedName,name])
    const removeNames = suggestionNames.filter(data => !selectedName.includes(data))
    setSuggestionNames(removeNames)
    

  }

//   console.log("suggestedName",selectedName)

  return (
    <>
      <div className="relative">
        <div className="relative mx-[30px] h-[40px] rounded-[20px] border-[1px] border-black flex flex-wrap items-center px-[20px]">
          {/* pills */}
          <div className=""></div>
          {/* search suggestion  */}
          <div className="absolute h-[200px] w-[30%] top-[40px] overflow-scroll px-[10px] py-[10px] rounded-md ">
            {suggestionNames.map((data, idx) => {
              return (
                <div
                  key={idx}
                  className="my-[5px] bg-gray-300 px-[5px] py-[5px] rounded-md cursor-pointer"
                  onClick={() => handelSelectedUser(data)}
                >
                  {data?.firstName}
                </div>
              );
            })}
          </div>
          <input
            className="focus:outline-none focus:ring-0"
            placeholder="search name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default MultiselectSearch;
