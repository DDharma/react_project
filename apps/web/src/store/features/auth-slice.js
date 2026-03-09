import { createSlice,PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    value: {
        isAuth:false,
        username:'',
        uid:'',
        isModerator:false
    }
}

export const auth = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers:{
        logout: () => {
            return initialState
        },
        login:(state,action) => {
            return {
                value:{
                    isAuth:true,
                    username:action.payload,
                    uid:'ahdajasjkhfskjfhs',
                    isModerator:false
                }
            }
        }
    }
})


export const {login, logout} = auth.actions;
export default auth.reducer;
