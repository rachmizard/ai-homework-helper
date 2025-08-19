import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ModeEnum, SubjectEnum } from "~/db";
import {
  detectSubjectAI,
  GenerateChatSchema,
  generateChatStream,
} from "~/handlers/homework-ai.handler";

export type StreamingMode = ModeEnum;

export interface StreamingResponse {
  content: string;
  subject: SubjectEnum;
  type: StreamingMode;
  done?: boolean;
}

export interface UseStreamingAIResult {
  isStreaming: boolean;
  streamingContent: string;
  streamingType: StreamingMode | null;
  error: string | null;
  startStream: (
    mode: StreamingMode,
    params: GenerateChatSchema
  ) => Promise<void>;
  resetStream: () => void;
}

const useChatMutation = () => {
  return useMutation({
    mutationFn: async (data: GenerateChatSchema) => {
      return await generateChatStream({
        data,
      });
    },
  });
};

export function useStreamingAI(): UseStreamingAIResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingType, setStreamingType] = useState<StreamingMode | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const chatMutation = useChatMutation();

  const resetStream = useCallback(() => {
    setIsStreaming(false);
    setStreamingContent("");
    setStreamingType(null);
    setError(null);
  }, []);

  const startStream = useCallback(
    async (mode: StreamingMode, params: GenerateChatSchema) => {
      setIsStreaming(true);
      setStreamingContent("");
      setStreamingType(mode);
      setError(null);

      try {
        let response: {
          chat?: string;
        } = {};

        response = await chatMutation.mutateAsync(params);

        const result = response.chat;

        const fullText = result || "";

        // Simulate streaming by gradually showing text
        let currentIndex = 0;
        const streamText = () => {
          if (currentIndex < fullText.length) {
            const nextIndex = Math.min(
              currentIndex + Math.random() * 3 + 1,
              fullText.length
            );
            setStreamingContent(fullText.substring(0, Math.floor(nextIndex)));
            currentIndex = nextIndex;

            // Variable delay to simulate natural typing
            const delay = Math.random() * 10 + 10;
            setTimeout(streamText, delay);
          } else {
            setIsStreaming(false);
            toast.success(
              `${mode.charAt(0).toUpperCase() + mode.slice(1)} generated! 🎉`
            );
          }
        };

        // Start the simulated streaming
        setTimeout(streamText, 100);
      } catch (err) {
        console.error("Streaming error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsStreaming(false);
        toast.error("Failed to generate response. Please try again.");
      }
    },
    []
  );

  return {
    isStreaming,
    streamingContent,
    streamingType,
    error,
    startStream,
    resetStream,
  };
}

// Subject detection hook
export const useSubjectDetection = () => {
  const detectSubjectMutation = useMutation({
    mutationFn: async (text: string) => {
      return await detectSubjectAI({ data: { text } });
    },
    onError: (error) => {
      console.log({
        error,
      });
      console.error("Subject detection error:", error);
      toast.error("Failed to detect subject. Using default.");
    },
  });

  const detectSubject = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      return await detectSubjectMutation.mutateAsync(text);
    },
    [detectSubjectMutation]
  );

  const resetSubject = useCallback(() => {
    detectSubjectMutation.reset();
  }, [detectSubjectMutation]);

  return {
    detectedSubject: detectSubjectMutation.data?.subject,
    isDetecting: detectSubjectMutation.isPending,
    detectSubject,
    resetSubject,
  };
};
