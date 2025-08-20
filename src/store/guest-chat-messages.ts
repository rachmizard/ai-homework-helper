import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ModeEnum } from "~/db/schema";

export interface GuestChatMessage {
  id: string;
  sessionId: string;
  type: "user" | "assistant";
  content: string;
  mode?: ModeEnum;
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface GuestChatMessagesStore {
  messages: GuestChatMessage[];
  addMessage: (message: Omit<GuestChatMessage, "id" | "createdAt">) => void;
  updateMessage: (id: string, updates: Partial<GuestChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  getMessagesBySessionId: (sessionId: string) => GuestChatMessage[];
  getLastMessage: () => GuestChatMessage | null;
}

const useGuestChatMessagesStore = create<GuestChatMessagesStore>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: (messageData) => {
        const newMessage: GuestChatMessage = {
          ...messageData,
          id: `guest-msg-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          createdAt: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }));
      },
      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },
      clearMessages: () => {
        set({ messages: [] });
      },
      getMessagesBySessionId: (sessionId) => {
        return get().messages.filter((msg) => msg.sessionId === sessionId);
      },
      getLastMessage: () => {
        const messages = get().messages;
        return messages.length > 0 ? messages[messages.length - 1] : null;
      },
    }),
    {
      name: "guest-chat-messages",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useGuestChatMessages = () => {
  return useGuestChatMessagesStore((state) => state);
};

export const useGuestMessages = () => {
  return useGuestChatMessagesStore((state) => state.messages);
};

export const useAddGuestMessage = () => {
  return useGuestChatMessagesStore((state) => state.addMessage);
};

export const useUpdateGuestMessage = () => {
  return useGuestChatMessagesStore((state) => state.updateMessage);
};

export const useRemoveGuestMessage = () => {
  return useGuestChatMessagesStore((state) => state.removeMessage);
};

export const useClearGuestMessages = () => {
  return useGuestChatMessagesStore((state) => state.clearMessages);
};

export const useGetGuestMessagesBySessionId = () => {
  return useGuestChatMessagesStore((state) => state.getMessagesBySessionId);
};

export const useGetLastGuestMessage = () => {
  return useGuestChatMessagesStore((state) => state.getLastMessage);
};
