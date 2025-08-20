import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  createChatCompletion,
  createStreamingChatCompletion,
  CHAT_CONFIGS,
} from "~/lib/open-ai.sdk";
import { authMiddleware } from "./middlewares/auth.middleware";
import { SubjectEnum, subjectEnum } from "~/db";

// Input validation schemas
export const detectSubjectSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export const extractTextFromImageSchema = z.object({
  imageData: z.string().min(1, "Image data is required"),
});

export const generateChatSchema = z.object({
  language: z.enum(["en", "id", "de", "es", "fr"]),
  extractedText: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export type GenerateChatSchema = z.infer<typeof generateChatSchema>;

// System prompts for different AI functions
const SYSTEM_PROMPTS = {
  // hint: {
  //   math: `You are a friendly AI tutor helping middle and high school students with math homework.
  //   Your role is to provide strategic HINTS that guide students to the solution without giving the full answer.
  //   Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
  //   Focus on the next logical step or key concept needed to progress.
  //   Never solve the problem completely - only guide towards the solution.
  //   Use a tone that feels supportive and teen-friendly.
  //   IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

  //   science: `You are a friendly AI tutor helping middle and high school students with science homework.
  //   Your role is to provide strategic HINTS that guide students to understand scientific concepts without giving complete answers.
  //   Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
  //   Focus on scientific method, key principles, or observation techniques.
  //   Never provide full explanations - only guide towards understanding.
  //   Use a tone that feels supportive and teen-friendly.
  //   IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

  //   writing: `You are a friendly AI tutor helping middle and high school students with writing assignments.
  //   Your role is to provide strategic HINTS for essay structure, brainstorming, or writing techniques without writing for them.
  //   Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
  //   Focus on writing strategies, organization tips, or brainstorming approaches.
  //   Never write content for them - only guide their thinking process.
  //   Use a tone that feels supportive and teen-friendly.
  //   IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

  //   summary: `You are a friendly AI tutor helping middle and high school students with text summarization.
  //   Your role is to provide strategic HINTS for identifying main ideas and key points without summarizing for them.
  //   Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
  //   Focus on reading strategies, identification techniques, or structural analysis.
  //   Never provide the summary - only guide their analytical thinking.
  //   Use a tone that feels supportive and teen-friendly.
  //   IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

  // },

  chat: `You are a friendly AI tutor helping middle and high school students with their homework and learning.
  Your role is to engage in helpful conversations about their academic questions, provide explanations, and guide their learning process.
  Be encouraging, supportive, and use a tone that feels teen-friendly with appropriate emojis.
  You can answer questions, explain concepts, provide examples, and help students understand their subjects better.
  Always aim to be educational and helpful while maintaining a conversational tone.
  IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

  subjectDetection: `Analyze the following text and determine the primary academic subject.
  Look for indicators like:
  - Math: equations, numbers, variables (x, y), mathematical terms (solve, calculate, simplify)
  - Science: scientific terms, experiments, phenomena, hypothesis, biology/chemistry/physics concepts
  - Writing: essay prompts, paragraph requests, creative writing, argumentative topics
  - Summary: requests to summarize, condense, or identify main ideas from longer texts
  - Programming: requests to write code, debug, or explain code
  - History: requests to write history essays, research papers, or discuss historical events
  - Geography: requests to write geography essays, research papers, or discuss geographical concepts
  - Economics: requests to write economics essays, research papers, or discuss economic concepts
  - Social Studies: requests to write social studies essays, research papers, or discuss social studies concepts
  - English: requests to write English essays, research papers, or discuss English concepts
  - Other: requests to write other essays, research papers, or discuss other concepts
  Respond with only one word: "math", "science", "writing", "summary", "programming", "history", "geography", "economics", "social studies", "english", or "other".
  If unclear, default to "math".`,
};

// Detect subject using OpenAI
export const detectSubjectAI = createServerFn({ method: "POST" })
  .validator(zodValidator(detectSubjectSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { text } = data;

      const completion = await createChatCompletion({
        ...CHAT_CONFIGS.PRECISE,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.subjectDetection,
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      const detectedSubject = completion.choices[0]?.message?.content
        ?.trim()
        .toLowerCase() as SubjectEnum;

      // Validate the response and default to math if invalid
      const validSubjects = subjectEnum.enumValues;
      const subject = validSubjects.includes(detectedSubject)
        ? detectedSubject
        : "other";

      return { subject };
    } catch (error) {
      console.error("Error detecting subject:", error);
      // Fall back to simple regex-based detection if AI fails
      const text = data.text.toLowerCase();
      let subject: "math" | "science" | "writing" | "summary" | "other" =
        "other";

      if (/\d+x|solve|equation|calculate|math|algebra|geometry/.test(text)) {
        subject = "math";
      } else if (/essay|write|paragraph|argument|thesis/.test(text)) {
        subject = "writing";
      } else if (/summarize|summary|main idea|condense/.test(text)) {
        subject = "summary";
      } else if (
        /science|physics|chemistry|biology|experiment|hypothesis/.test(text)
      ) {
        subject = "science";
      }

      return { subject };
    }
  });

// Extract text from image using OCR (Tesseract.js integration)
export const extractTextFromImage = createServerFn({ method: "POST" })
  .validator(zodValidator(extractTextFromImageSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { imageData } = data;

      // For now, we'll use a mock implementation
      // In production, you would integrate with Tesseract.js or Google Cloud Vision
      // This is a placeholder that simulates OCR processing

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock extracted text based on common homework patterns
      const mockTexts = [
        "Solve: 2x + 3 = 7",
        "What is photosynthesis?",
        "Write an essay about climate change",
        "Summarize the main points of this article",
        "Calculate the area of a triangle with base 5 and height 8",
        "Explain the water cycle",
      ];

      const extractedText =
        mockTexts[Math.floor(Math.random() * mockTexts.length)];

      return { extractedText };
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw new Error("Failed to extract text from image");
    }
  });

// Generate chat using OpenAI with streaming
export const generateChatStream = createServerFn({ method: "POST" })
  .validator(zodValidator(generateChatSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { messages } = data;

      // Build messages array with conversation history
      const conversationMessages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
        {
          role: "system",
          content: SYSTEM_PROMPTS.chat,
        },
      ];

      // Add previous conversation messages if provided
      if (messages && messages.length > 0) {
        conversationMessages.push(...messages);
      }

      const stream = await createStreamingChatCompletion({
        ...CHAT_CONFIGS.CREATIVE,
        stream: true,
        messages: conversationMessages,
      });

      // Collect all streaming content
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      }

      return { chat: fullContent };
    } catch (error) {
      console.error("Error generating chat stream:", error);
      throw new Error("Failed to generate chat stream");
    }
  });
