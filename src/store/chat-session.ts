import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SessionId = string | null;

interface ChatSessionStore {
  sessionId: SessionId;
  setSessionId: (sessionId: SessionId) => void;
}

const useChatSessionStore = create<ChatSessionStore>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (sessionId) => set({ sessionId }),
    }),
    {
      name: "chat-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useGetChatSession = () => {
  return useChatSessionStore((state) => state.sessionId);
};

export const useSetChatSession = () => {
  return useChatSessionStore((state) => state.setSessionId);
};
