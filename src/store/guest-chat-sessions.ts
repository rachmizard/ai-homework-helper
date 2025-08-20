import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SubjectEnum, InputMethodEnum } from "~/db/schema";

export interface GuestChatSession {
  id: string;
  title: string;
  subject: SubjectEnum;
  inputMethod: InputMethodEnum;
  originalInput: string;
  extractedText?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GuestChatSessionsStore {
  session: GuestChatSession | null;
  createSession: (
    session: Omit<GuestChatSession, "id" | "createdAt" | "updatedAt">
  ) => GuestChatSession;
  updateSession: (updates: Partial<GuestChatSession>) => void;
  clearSession: () => void;
  hasSession: () => boolean;
}

const useGuestChatSessionsStore = create<GuestChatSessionsStore>()(
  persist(
    (set, get) => ({
      session: null,
      createSession: (sessionData) => {
        const newSession: GuestChatSession = {
          ...sessionData,
          id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ session: newSession });

        return newSession;
      },
      updateSession: (updates) => {
        const currentSession = get().session;
        if (currentSession) {
          set({
            session: {
              ...currentSession,
              ...updates,
              updatedAt: new Date(),
            },
          });
        }
      },
      clearSession: () => {
        set({ session: null });
      },
      hasSession: () => {
        return get().session !== null;
      },
    }),
    {
      name: "guest-chat-sessions",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useGuestChatSessions = () => {
  return useGuestChatSessionsStore((state) => state);
};

export const useGuestChatSession = () => {
  return useGuestChatSessionsStore((state) => state.session);
};

export const useCreateGuestSession = () => {
  return useGuestChatSessionsStore((state) => state.createSession);
};

export const useUpdateGuestSession = () => {
  return useGuestChatSessionsStore((state) => state.updateSession);
};

export const useClearGuestSession = () => {
  return useGuestChatSessionsStore((state) => state.clearSession);
};

export const useHasGuestSession = () => {
  return useGuestChatSessionsStore((state) => state.hasSession);
};
