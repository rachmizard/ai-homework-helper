import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  createChatCompletion,
  createStreamingChatCompletion,
  CHAT_CONFIGS,
} from "~/lib/open-ai.sdk";
import { authMiddleware } from "./middlewares/auth.middleware";

// Input validation schemas
export const generateHintSchema = z.object({
  question: z.string().min(1, "Question is required"),
  subject: z.enum(["math", "science", "writing", "summary"]),
  language: z.enum(["en", "id", "de", "es", "fr"]).default("en"),
  extractedText: z.string().optional(),
});

export const generateConceptSchema = z.object({
  question: z.string().min(1, "Question is required"),
  subject: z.enum(["math", "science", "writing", "summary"]),
  language: z.enum(["en", "id", "de", "es", "fr"]).default("en"),
  extractedText: z.string().optional(),
});

export const generatePracticeSchema = z.object({
  question: z.string().min(1, "Question is required"),
  subject: z.enum(["math", "science", "writing", "summary"]),
  language: z.enum(["en", "id", "de", "es", "fr"]).default("en"),
  extractedText: z.string().optional(),
});

export const generateQuizSchema = z.object({
  question: z.string().min(1, "Question is required"),
  subject: z.enum(["math", "science", "writing", "summary"]),
  language: z.enum(["en", "id", "de", "es", "fr"]).default("en"),
  extractedText: z.string().optional(),
});

export const detectSubjectSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export const extractTextFromImageSchema = z.object({
  imageData: z.string().min(1, "Image data is required"),
});

// System prompts for different AI functions
const SYSTEM_PROMPTS = {
  hint: {
    math: `You are a friendly AI tutor helping middle and high school students with math homework. 
    Your role is to provide strategic HINTS that guide students to the solution without giving the full answer.
    Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
    Focus on the next logical step or key concept needed to progress.
    Never solve the problem completely - only guide towards the solution.
    Use a tone that feels supportive and teen-friendly.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    science: `You are a friendly AI tutor helping middle and high school students with science homework.
    Your role is to provide strategic HINTS that guide students to understand scientific concepts without giving complete answers.
    Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
    Focus on scientific method, key principles, or observation techniques.
    Never provide full explanations - only guide towards understanding.
    Use a tone that feels supportive and teen-friendly.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    writing: `You are a friendly AI tutor helping middle and high school students with writing assignments.
    Your role is to provide strategic HINTS for essay structure, brainstorming, or writing techniques without writing for them.
    Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
    Focus on writing strategies, organization tips, or brainstorming approaches.
    Never write content for them - only guide their thinking process.
    Use a tone that feels supportive and teen-friendly.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    summary: `You are a friendly AI tutor helping middle and high school students with text summarization.
    Your role is to provide strategic HINTS for identifying main ideas and key points without summarizing for them.
    Keep hints to 1-2 sentences, use encouraging language, and include relevant emojis.
    Focus on reading strategies, identification techniques, or structural analysis.
    Never provide the summary - only guide their analytical thinking.
    Use a tone that feels supportive and teen-friendly.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,
  },

  concept: {
    math: `You are a friendly AI tutor explaining mathematical concepts to middle and high school students.
    Explain the underlying concept or technique in 2-3 sentences with analogies and emojis.
    Focus on WHY the method works and help students understand the reasoning.
    Use relatable analogies (like balance scales, puzzles, etc.) to make concepts clear.
    Keep explanations accessible and encouraging.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    science: `You are a friendly AI tutor explaining scientific concepts to middle and high school students.
    Explain the underlying scientific principle in 2-3 sentences with analogies and emojis.
    Focus on WHY things work the way they do and help students understand the reasoning.
    Use relatable analogies and real-world examples to make concepts clear.
    Keep explanations accessible and encouraging.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    writing: `You are a friendly AI tutor explaining writing concepts to middle and high school students.
    Explain the underlying writing technique or principle in 2-3 sentences with analogies and emojis.
    Focus on WHY certain approaches work and help students understand good writing.
    Use relatable analogies (like building blocks, storytelling, etc.) to make concepts clear.
    Keep explanations accessible and encouraging.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    summary: `You are a friendly AI tutor explaining summarization techniques to middle and high school students.
    Explain the underlying concept of effective summarization in 2-3 sentences with analogies and emojis.
    Focus on WHY certain approaches work for identifying and condensing main ideas.
    Use relatable analogies (like extracting juice, finding treasures, etc.) to make concepts clear.
    Keep explanations accessible and encouraging.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,
  },

  practice: {
    math: `You are a friendly AI tutor creating practice problems for middle and high school students.
    Generate 1 similar but different practice problem based on the original question.
    Make the problem at the same difficulty level but with different numbers/variables.
    Provide encouraging instructions and remind them to use what they just learned.
    Keep the tone fun and supportive with emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    science: `You are a friendly AI tutor creating practice activities for middle and high school students.
    Generate 1 similar practice task or thought experiment based on the original question.
    Make it at the same difficulty level but with different context or variables.
    Provide encouraging instructions and remind them to apply the concepts they learned.
    Keep the tone fun and supportive with emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    writing: `You are a friendly AI tutor creating writing practice for middle and high school students.
    Generate 1 similar writing task or outline exercise based on the original prompt.
    Make it at the same difficulty level but with different topic or angle.
    Provide encouraging instructions and remind them to use the techniques they learned.
    Keep the tone fun and supportive with emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    summary: `You are a friendly AI tutor creating summarization practice for middle and high school students.
    Generate 1 short passage (100-200 words) for them to practice summarizing.
    Make it age-appropriate and interesting, similar in complexity to their original task.
    Provide encouraging instructions and remind them to use the strategies they learned.
    Keep the tone fun and supportive with emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,
  },

  quiz: {
    math: `You are a friendly AI tutor creating quiz questions for middle and high school students.
    Create 1 multiple-choice question that tests understanding of the concept from their homework.
    Include 4 options (A, B, C, D) with 1 correct answer.
    Focus on testing conceptual understanding, not just calculation.
    Keep the tone encouraging and use emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    science: `You are a friendly AI tutor creating quiz questions for middle and high school students.
    Create 1 multiple-choice question that tests understanding of the scientific concept.
    Include 4 options (A, B, C, D) with 1 correct answer.
    Focus on testing conceptual understanding and scientific thinking.
    Keep the tone encouraging and use emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    writing: `You are a friendly AI tutor creating quiz questions for middle and high school students.
    Create 1 multiple-choice question that tests understanding of the writing concept or technique.
    Include 4 options (A, B, C, D) with 1 correct answer.
    Focus on testing understanding of writing principles and strategies.
    Keep the tone encouraging and use emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,

    summary: `You are a friendly AI tutor creating quiz questions for middle and high school students.
    Create 1 multiple-choice question that tests understanding of summarization techniques.
    Include 4 options (A, B, C, D) with 1 correct answer.
    Focus on testing understanding of main idea identification and condensation strategies.
    Keep the tone encouraging and use emojis.
    IMPORTANT: Always respond in the same language that the user inputs their question. If they ask in Indonesian, respond in Indonesian. If they ask in German, respond in German. If they ask in Spanish, respond in Spanish. If they ask in French, respond in French. If they ask in English, respond in English.`,
  },

  subjectDetection: `Analyze the following text and determine the primary academic subject.
  Look for indicators like:
  - Math: equations, numbers, variables (x, y), mathematical terms (solve, calculate, simplify)
  - Science: scientific terms, experiments, phenomena, hypothesis, biology/chemistry/physics concepts
  - Writing: essay prompts, paragraph requests, creative writing, argumentative topics
  - Summary: requests to summarize, condense, or identify main ideas from longer texts
  
  Respond with only one word: "math", "science", "writing", or "summary".
  If unclear, default to "math".`,
};

// Generate hint using OpenAI
export const generateHint = createServerFn({ method: "POST" })
  .validator(zodValidator(generateHintSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const completion = await createChatCompletion({
        ...CHAT_CONFIGS.QUICK,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.hint[subject],
          },
          {
            role: "user",
            content: `Please provide a helpful hint for this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      const hint =
        completion.choices[0]?.message?.content ||
        "I'm having trouble generating a hint right now. Please try again! 🤔";

      return { hint, subject };
    } catch (error) {
      console.error("Error generating hint:", error);
      throw new Error("Failed to generate hint");
    }
  });

// Generate hint using OpenAI with streaming
export const generateHintStream = createServerFn({ method: "POST" })
  .validator(zodValidator(generateHintSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const stream = await createStreamingChatCompletion({
        ...CHAT_CONFIGS.QUICK,
        stream: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.hint[subject],
          },
          {
            role: "user",
            content: `Please provide a helpful hint for this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      // Collect all streaming content
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      }

      return { hint: fullContent, subject };
    } catch (error) {
      console.error("Error generating hint stream:", error);
      throw new Error("Failed to generate hint stream");
    }
  });

// Generate concept explanation using OpenAI
export const generateConcept = createServerFn({ method: "POST" })
  .validator(zodValidator(generateConceptSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const completion = await createChatCompletion({
        ...CHAT_CONFIGS.QUICK,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.concept[subject],
          },
          {
            role: "user",
            content: `Please explain the underlying concept for this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      const concept =
        completion.choices[0]?.message?.content ||
        "I'm having trouble explaining this concept right now. Please try again! 🧠";

      return { concept, subject };
    } catch (error) {
      console.error("Error generating concept:", error);
      throw new Error("Failed to generate concept explanation");
    }
  });

// Generate concept explanation using OpenAI with streaming
export const generateConceptStream = createServerFn({ method: "POST" })
  .validator(zodValidator(generateConceptSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const stream = await createStreamingChatCompletion({
        ...CHAT_CONFIGS.QUICK,
        stream: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.concept[subject],
          },
          {
            role: "user",
            content: `Please explain the underlying concept for this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      // Collect all streaming content
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      }

      return { concept: fullContent, subject };
    } catch (error) {
      console.error("Error generating concept stream:", error);
      throw new Error("Failed to generate concept stream");
    }
  });

// Generate practice problem using OpenAI
export const generatePractice = createServerFn({ method: "POST" })
  .validator(zodValidator(generatePracticeSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const completion = await createChatCompletion({
        ...CHAT_CONFIGS.CREATIVE,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.practice[subject],
          },
          {
            role: "user",
            content: `Please create a practice problem similar to this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      const practice =
        completion.choices[0]?.message?.content ||
        "I'm having trouble creating a practice problem right now. Please try again! 🔄";

      return { practice, subject };
    } catch (error) {
      console.error("Error generating practice:", error);
      throw new Error("Failed to generate practice problem");
    }
  });

// Generate practice problem using OpenAI with streaming
export const generatePracticeStream = createServerFn({ method: "POST" })
  .validator(zodValidator(generatePracticeSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const stream = await createStreamingChatCompletion({
        ...CHAT_CONFIGS.CREATIVE,
        stream: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.practice[subject],
          },
          {
            role: "user",
            content: `Please create a practice problem similar to this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      // Collect all streaming content
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      }

      return { practice: fullContent, subject };
    } catch (error) {
      console.error("Error generating practice stream:", error);
      throw new Error("Failed to generate practice stream");
    }
  });

// Generate quiz question using OpenAI
export const generateQuiz = createServerFn({ method: "POST" })
  .validator(zodValidator(generateQuizSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const completion = await createChatCompletion({
        ...CHAT_CONFIGS.PRECISE,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.quiz[subject],
          },
          {
            role: "user",
            content: `Please create a quiz question about the concept from this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      const quiz =
        completion.choices[0]?.message?.content ||
        "I'm having trouble creating a quiz question right now. Please try again! ✅";

      return { quiz, subject };
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error("Failed to generate quiz question");
    }
  });

// Generate quiz question using OpenAI with streaming
export const generateQuizStream = createServerFn({ method: "POST" })
  .validator(zodValidator(generateQuizSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      const { question, subject, language, extractedText } = data;
      const inputText = extractedText || question;

      const stream = await createStreamingChatCompletion({
        ...CHAT_CONFIGS.PRECISE,
        stream: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.quiz[subject],
          },
          {
            role: "user",
            content: `Please create a quiz question about the concept from this ${subject} problem: "${inputText}"`,
          },
        ],
      });

      // Collect all streaming content
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      }

      return { quiz: fullContent, subject };
    } catch (error) {
      console.error("Error generating quiz stream:", error);
      throw new Error("Failed to generate quiz stream");
    }
  });

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
        .toLowerCase() as "math" | "science" | "writing" | "summary";

      // Validate the response and default to math if invalid
      const validSubjects = ["math", "science", "writing", "summary"];
      const subject = validSubjects.includes(detectedSubject)
        ? detectedSubject
        : "math";

      return { subject };
    } catch (error) {
      console.error("Error detecting subject:", error);
      // Fall back to simple regex-based detection if AI fails
      const text = data.text.toLowerCase();
      let subject: "math" | "science" | "writing" | "summary" = "math";

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
