import OpenAI from "openai";
import { env } from "./env-config";

// Initialize OpenAI client with the API key from environment
export const openai = new OpenAI({
  apiKey: env.OPENAI_SDK_KEY,
});

// Export commonly used types from OpenAI
export type {
  ChatCompletion,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsBase,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

export type {
  EmbeddingCreateParams,
  Embedding,
} from "openai/resources/embeddings";

export type { ImageGenerateParams, Image } from "openai/resources/images";

// Helper function to create chat completions
export async function createChatCompletion(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  try {
    return await openai.chat.completions.create(params);
  } catch (error) {
    console.error("Error creating chat completion:", error);
    throw error;
  }
}

// Helper function to create streaming chat completions
export async function createStreamingChatCompletion(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  try {
    return await openai.chat.completions.create(params);
  } catch (error) {
    console.error("Error creating streaming chat completion:", error);
    throw error;
  }
}

// Helper function to create embeddings
export async function createEmbedding(
  params: OpenAI.EmbeddingCreateParams
): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> {
  try {
    return await openai.embeddings.create(params);
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

// Helper function to generate images
export async function generateImage(
  params: OpenAI.ImageGenerateParams & { stream?: false }
): Promise<OpenAI.Images.ImagesResponse> {
  try {
    return await openai.images.generate(params);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Default models for easy reference
export const DEFAULT_MODELS = {
  CHAT: "gpt-4o-mini" as const,
  CHAT_ADVANCED: "gpt-4o" as const,
  EMBEDDING: "text-embedding-3-small" as const,
  EMBEDDING_LARGE: "text-embedding-3-large" as const,
  IMAGE: "dall-e-3" as const,
} as const;

// Common chat completion configurations
export const CHAT_CONFIGS = {
  // Fast and efficient for most tasks
  QUICK: {
    model: DEFAULT_MODELS.CHAT,
    temperature: 0.7,
    max_tokens: 1000,
  },
  // More creative responses
  CREATIVE: {
    model: DEFAULT_MODELS.CHAT,
    temperature: 1.0,
    max_tokens: 2000,
  },
  // Precise and deterministic
  PRECISE: {
    model: DEFAULT_MODELS.CHAT,
    temperature: 0.1,
    max_tokens: 1500,
  },
  // Advanced reasoning tasks
  ADVANCED: {
    model: DEFAULT_MODELS.CHAT_ADVANCED,
    temperature: 0.7,
    max_tokens: 4000,
  },
} as const;

export default openai;
