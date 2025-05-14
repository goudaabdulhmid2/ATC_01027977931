import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoaderState {
  loading: boolean;
  message?: string;
}

const initialState: LoaderState = {
  loading: false,
  message: undefined,
};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    setLoading: (
      state,
      action: PayloadAction<{ loading: boolean; message?: string }>
    ) => {
      state.loading = action.payload.loading;
      state.message = action.payload.message;
    },
  },
});

export const { setLoading } = loaderSlice.actions;
export default loaderSlice.reducer;
