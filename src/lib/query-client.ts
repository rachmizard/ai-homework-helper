import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401 (unauthorized) or 403 (forbidden)
        if (
          error instanceof Error &&
          (error.message.includes("Unauthorized") ||
            error.message.includes("not_authenticated"))
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Query Keys Factory
export const queryKeys = {
  // Chat sessions
  chatSessions: ["chat-sessions"] as const,
  chatSession: (id: string) => ["chat-sessions", id] as const,

  // User progress
  userProgress: ["user-progress"] as const,
  userProgressSummary: ["user-progress", "summary"] as const,

  // Chat messages
  chatMessages: (sessionId: string) => ["chat-messages", sessionId] as const,
} as const;
