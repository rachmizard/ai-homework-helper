import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";

// Enum for detected subjects
export const subjectEnum = pgEnum("subject", [
  "math",
  "science",
  "writing",
  "summary",
]);

// Enum for input methods
export const inputMethodEnum = pgEnum("input_method", ["photo", "text"]);

// Chat sessions table - represents a homework session
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(), // Generated title for the session
  subject: subjectEnum("subject").notNull(),
  inputMethod: inputMethodEnum("input_method").notNull(),
  originalInput: text("original_input").notNull(), // The original homework question/problem
  extractedText: text("extracted_text"), // OCR extracted text if photo was uploaded
  isActive: varchar("is_active", { length: 10 }).default("true").notNull(), // Track if session is ongoing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat messages table - stores individual messages in a session
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => chatSessions.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  mode: varchar("mode", { length: 20 }), // "hint", "concept", "practice", "quiz" for assistant messages
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Store additional data like processing time, confidence scores, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress tracking - aggregate stats per user
export const userProgress = pgTable("user_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  subject: subjectEnum("subject").notNull(),
  tasksAttempted: varchar("tasks_attempted", { length: 10 })
    .default("0")
    .notNull(),
  hintsUsed: varchar("hints_used", { length: 10 }).default("0").notNull(),
  conceptsLearned: varchar("concepts_learned", { length: 10 })
    .default("0")
    .notNull(),
  practiceCompleted: varchar("practice_completed", { length: 10 })
    .default("0")
    .notNull(),
  quizzesTaken: varchar("quizzes_taken", { length: 10 }).default("0").notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertChatSessionSchema = createInsertSchema(chatSessions);
export const selectChatSessionSchema = createSelectSchema(chatSessions);

export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createSelectSchema(chatMessages);

export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);

// TypeScript types
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// Extended types for API responses
export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface UserProgressSummary {
  totalTasks: number;
  totalHints: number;
  totalConcepts: number;
  totalPractice: number;
  totalQuizzes: number;
  subjectBreakdown: Record<
    string,
    {
      tasks: number;
      hints: number;
      concepts: number;
      practice: number;
      quizzes: number;
    }
  >;
}
