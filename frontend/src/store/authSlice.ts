import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
  email: string;
  userId: string;
}
interface UserState {
  user: null | User;
  status: boolean;
}

const initialState: UserState = {
  user: null,
  status: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserState["user"]>) {
      localStorage.setItem("user", JSON.stringify(action.payload));

      state.user = action.payload;
      state.status = true;
    },
    logout(state) {
      localStorage.removeItem("user");
      state.user = null;
      state.status = false;
    },
  },
});

export default authSlice.reducer;
export const { login, logout } = authSlice.actions;
