import { configureStore } from "@reduxjs/toolkit";
import drones from "./dronesSlice.js";

const store = configureStore({
  reducer: { drones },
});

export default store;
