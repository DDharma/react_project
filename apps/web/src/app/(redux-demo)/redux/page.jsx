"use client";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "@/store/features/auth-slice";
import { addToCart } from "@/store/features/cart-slice";
import { useState } from "react";

export default function Home() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.authReducer.value.username);
  const [username, setUsername] = useState("");

  const setLogin = () => {
    dispatch(addToCart(username));
  };
  const setLogout = () => {
    dispatch(logout());
  };

  console.log(useSelector((state) => state.cartReducer))
  return (
    <div className="w-[300px]">
      <h1>{state}</h1>
      <h1>Redux</h1>
      <input
        className='"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"'
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => setLogin()}
      >
        Login
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => setLogout()}
      >
        Logout
      </button>
    </div>
  );
}
