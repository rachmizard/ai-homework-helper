import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  generateConceptStream,
  generateHintStream,
  generatePracticeStream,
  generateQuizStream,
  detectSubjectAI,
} from "~/handlers/homework-ai.handler";

export type StreamingMode = "hint" | "concept" | "practice" | "quiz";
export type Subject = "math" | "science" | "writing" | "summary";

export interface StreamingResponse {
  content: string;
  subject: Subject;
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
    params: {
      question: string;
      subject: Subject;
      extractedText?: string;
    }
  ) => Promise<void>;
  resetStream: () => void;
}

const useHintMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      question: string;
      subject: Subject;
      extractedText?: string;
    }) => {
      return await generateHintStream({
        data,
      });
    },
  });
};

const useConceptMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      question: string;
      subject: Subject;
      extractedText?: string;
    }) => {
      return await generateConceptStream({
        data,
      });
    },
  });
};

const usePracticeMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      question: string;
      subject: Subject;
      extractedText?: string;
    }) => {
      return await generatePracticeStream({
        data,
      });
    },
  });
};

const useQuizMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      question: string;
      subject: Subject;
      extractedText?: string;
    }) => {
      return await generateQuizStream({
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
  const hintMutation = useHintMutation();
  const conceptMutation = useConceptMutation();
  const practiceMutation = usePracticeMutation();
  const quizMutation = useQuizMutation();

  const resetStream = useCallback(() => {
    setIsStreaming(false);
    setStreamingContent("");
    setStreamingType(null);
    setError(null);
  }, []);

  const startStream = useCallback(
    async (
      mode: StreamingMode,
      params: {
        question: string;
        subject: Subject;
        extractedText?: string;
      }
    ) => {
      setIsStreaming(true);
      setStreamingContent("");
      setStreamingType(mode);
      setError(null);

      try {
        let response: {
          hint?: string;
          concept?: string;
          practice?: string;
          quiz?: string;
        } = {};

        if (mode === "hint") {
          response = await hintMutation.mutateAsync(params);
        } else if (mode === "concept") {
          response = await conceptMutation.mutateAsync(params);
        } else if (mode === "practice") {
          response = await practiceMutation.mutateAsync(params);
        } else if (mode === "quiz") {
          response = await quizMutation.mutateAsync(params);
        }

        const result = response[mode];

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
            const delay = Math.random() * 20 + 15;
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
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSubject, setDetectedSubject] = useState<Subject | null>(null);

  const detectSubjectMutation = useMutation({
    mutationFn: async (text: string) => {
      return await detectSubjectAI({ data: { text } });
    },
    onSuccess: (data) => {
      setDetectedSubject(data.subject);
      toast.success(`Detected subject: ${data.subject} 🎯`);
    },
    onError: (error) => {
      console.error("Subject detection error:", error);
      toast.error("Failed to detect subject. Using default.");
      // Fall back to default subject
      setDetectedSubject("math");
    },
  });

  const detectSubject = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsDetecting(true);
      try {
        await detectSubjectMutation.mutateAsync(text);
      } finally {
        setIsDetecting(false);
      }
    },
    [detectSubjectMutation]
  );

  const resetSubject = useCallback(() => {
    setDetectedSubject(null);
  }, []);

  return {
    detectedSubject,
    isDetecting,
    detectSubject,
    resetSubject,
  };
};
