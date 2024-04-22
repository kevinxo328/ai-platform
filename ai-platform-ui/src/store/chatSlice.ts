import { StateCreator } from "zustand";
import { MessageTypeEnum, RoleEnum } from "../types/chat";
import type { Message } from "../types/chat";

type State = {
  messages: Message[];
  isStreaming: boolean;
  disabled: boolean;
};

type Actions = {
  addMessage: (message: Message) => void;
  filterLoadingMessages: () => void;
  resetMessages: () => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setDissabled: (disabled: boolean) => void;
};

export type ChatSlice = State & Actions;

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (
  set
) => ({
  messages: [],
  isStreaming: false,
  disabled: false,
  addMessage: (message) =>
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      /**
       * If the last message was from the AI and the current message is from the AI
       * then we want to combine the messages into one.
       */
      if (
        message.role === RoleEnum.ai &&
        lastMessage?.role === RoleEnum.ai &&
        lastMessage?.messageType === MessageTypeEnum.text
      ) {
        return {
          messages: [
            ...state.messages.slice(0, -1),
            {
              ...lastMessage,
              message: lastMessage.message.concat(message.message),
            },
          ],
        };
      }
      return { messages: [...state.messages, message] };
    }),
  filterLoadingMessages: () =>
    set((state) => ({
      messages: state.messages.filter(
        (message) => message.messageType !== MessageTypeEnum.loading
      ),
    })),
  setIsStreaming: (isStreaming) => set(() => ({ isStreaming })),
  resetMessages: () => set(() => ({ messages: [] })),
  setDissabled: (disabled: boolean) => set(() => ({ disabled })),
});
