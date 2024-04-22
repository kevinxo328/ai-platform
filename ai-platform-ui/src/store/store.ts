import { create } from "zustand";
import { ChatSlice, createChatSlice } from "./chatSlice";

export const useStore = create<ChatSlice>()((...a) => ({
  ...createChatSlice(...a),
}));
