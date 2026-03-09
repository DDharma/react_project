import { createSlice } from "@reduxjs/toolkit";

const cartInitialState = {
  value: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  },
};

export const cart = createSlice({
  name: "cart",
  initialState: cartInitialState,
  reducers: {
    addToCart: (state, action) => {
      console.log("action", action);

      return {
        ...state,
        value: {
          ...state.value,
          items: [...state.value.items, action.payload],
          totalItems:state.value.totalItems+1
        },
      };
    },
  },
});

export const { addToCart } = cart.actions;
export default cart.reducer;
