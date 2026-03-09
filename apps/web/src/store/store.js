import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth-slice";
import cartReducer from "./features/cart-slice";


export const store = configureStore({
  reducer: {
    authReducer:authReducer,
    cartReducer:cartReducer
  },
});
