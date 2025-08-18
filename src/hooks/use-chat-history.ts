import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createChatSession,
  addChatMessage,
  updateUserProgress,
  getUserChatSessions,
  getChatSessionWithMessages,
  updateSessionTitle,
  endChatSession,
  getUserProgressSummary,
} from "~/handlers/chat-history.handler";
import { queryKeys } from "~/lib/query-client";
import type {
  ChatSession,
  ChatSessionWithMessages,
  NewChatSession,
  NewChatMessage,
  UserProgressSummary,
} from "~/db/schema";

// Hook to fetch user's chat sessions
export function useChatSessions() {
  return useQuery({
    queryKey: queryKeys.chatSessions,
    queryFn: async () => {
      return await getUserChatSessions();
    },
  });
}

// Hook to fetch a specific chat session with messages
export function useChatSession(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.chatSession(sessionId || ""),
    queryFn: async () => {
      if (!sessionId) return null;
      return await getChatSessionWithMessages({ data: sessionId });
    },
    enabled: !!sessionId,
  });
}

// Hook to fetch user progress summary
export function useUserProgressSummary() {
  return useQuery({
    queryKey: queryKeys.userProgressSummary,
    queryFn: async () => {
      return await getUserProgressSummary();
    },
  });
}

// Hook to create a new chat session
export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewChatSession) => {
      return await createChatSession({ data });
    },
    onSuccess: (newSession) => {
      // Invalidate and refetch chat sessions
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatSessions,
      });

      // Add the new session to the cache
      queryClient.setQueryData(queryKeys.chatSession(newSession.id), {
        ...newSession,
        messages: [],
      } as ChatSessionWithMessages);

      toast.success("New homework session started! 🚀");
    },
    onError: (error) => {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    },
  });
}

// Hook to add a message to a chat session
export function useAddChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewChatMessage) => {
      return await addChatMessage({ data });
    },
    onMutate: async ({ sessionId, ...message }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.chatSession(sessionId),
      });

      // Snapshot the previous value
      const previousSession = queryClient.getQueryData<ChatSessionWithMessages>(
        queryKeys.chatSession(sessionId)
      );

      // Optimistically update the session with the new message
      if (previousSession) {
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          sessionId,
          type: message.type,
          content: message.content,
          mode: message.mode || null,
          metadata: message.metadata || null,
          createdAt: new Date(),
        };

        queryClient.setQueryData<ChatSessionWithMessages>(
          queryKeys.chatSession(sessionId),
          {
            ...previousSession,
            messages: [...previousSession.messages, optimisticMessage],
            updatedAt: new Date(),
          }
        );
      }

      return { previousSession };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousSession) {
        queryClient.setQueryData(
          queryKeys.chatSession(variables.sessionId),
          context.previousSession
        );
      }
      console.error("Error adding message:", error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatSession(variables.sessionId),
      });

      // Update sessions list timestamp
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatSessions,
      });
    },
  });
}

// Hook to update user progress
export function useUpdateUserProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subject: "math" | "science" | "writing" | "summary";
      action: "task" | "hint" | "concept" | "practice" | "quiz";
    }) => {
      return await updateUserProgress({ data });
    },
    onSuccess: () => {
      // Invalidate progress queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProgressSummary,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProgress,
      });
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
    },
  });
}

// Hook to update session title
export function useUpdateSessionTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string; title: string }) => {
      return await updateSessionTitle({ data });
    },
    onMutate: async ({ sessionId, title }) => {
      // Cancel queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.chatSession(sessionId),
      });

      // Optimistically update
      const previousSession = queryClient.getQueryData<ChatSessionWithMessages>(
        queryKeys.chatSession(sessionId)
      );

      if (previousSession) {
        queryClient.setQueryData<ChatSessionWithMessages>(
          queryKeys.chatSession(sessionId),
          { ...previousSession, title }
        );
      }

      return { previousSession };
    },
    onError: (error, variables, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(
          queryKeys.chatSession(variables.sessionId),
          context.previousSession
        );
      }
      console.error("Error updating session title:", error);
      toast.error("Failed to update session title");
    },
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatSessions,
      });
      toast.success("Session title updated! 💾");
    },
  });
}

// Hook to end/deactivate a session
export function useEndChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      return await endChatSession({ data: sessionId });
    },
    onSuccess: (data, sessionId) => {
      // Update the session in cache
      queryClient.setQueryData<ChatSessionWithMessages>(
        queryKeys.chatSession(sessionId),
        (old) => (old ? { ...old, isActive: "false" } : old)
      );

      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatSessions,
      });

      toast.success("Session saved! 💾");
    },
    onError: (error) => {
      console.error("Error ending session:", error);
      toast.error("Failed to save session");
    },
  });
}
