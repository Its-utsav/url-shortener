import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.status = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.status = false;
      localStorage.removeItem("user");
    },
  },
});

export default authSlice.reducer;
export const { login, logout } = authSlice.actions;
