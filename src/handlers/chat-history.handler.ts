import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/db";
import {
  chatMessages,
  chatSessions,
  insertChatMessageSchema,
  insertChatSessionSchema,
  SubjectEnum,
  userProgress,
  type ChatMessage,
  type ChatSessionWithMessages,
  type UserProgressSummary,
} from "~/db/schema";
import { getUser } from "./user.handler";
import { authMiddleware } from "./middlewares/auth.middleware";
import { zodValidator } from "@tanstack/zod-adapter";

// Create a new chat session
export const createChatSession = createServerFn({ method: "POST" })
  .validator(zodValidator(insertChatSessionSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      const [session] = await db
        .insert(chatSessions)
        .values({
          ...data,
          userId: user.id,
        })
        .returning();

      return session;
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw new Error("Failed to create chat session");
    }
  });

// Get user's chat sessions
export const getUserChatSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, user.id))
        .orderBy(desc(chatSessions.updatedAt));

      return sessions;
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      throw new Error("Failed to fetch chat sessions");
    }
  }
);

// Get a specific chat session with messages
export const getChatSessionWithMessages = createServerFn({ method: "GET" })
  .validator((sessionId: string) => sessionId)
  .middleware([authMiddleware])
  .handler(async ({ data: sessionId }): Promise<ChatSessionWithMessages> => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      // Get session
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id))
        );

      if (!session) {
        throw new Error("Session not found");
      }

      // Get messages for this session
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);

      return {
        ...session,
        messages,
      };
    } catch (error) {
      console.error("Error fetching chat session:", error);
      throw new Error("Failed to fetch chat session");
    }
  });

// Add a message to a chat session
export const addChatMessage = createServerFn({ method: "POST" })
  .validator(zodValidator(insertChatMessageSchema))
  .middleware([authMiddleware])
  .handler(async ({ data }): Promise<ChatMessage> => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      // Verify session belongs to user
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.id, data.sessionId),
            eq(chatSessions.userId, user.id)
          )
        );

      if (!session) {
        throw new Error("Session not found");
      }

      // Add message
      const [message] = await db
        .insert(chatMessages)
        .values({
          ...data,
          sessionId: data.sessionId,
        })
        .returning();

      // Update session timestamp
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, data.sessionId));

      return message;
    } catch (error) {
      console.error("Error adding chat message:", error);
      throw new Error("Failed to add chat message");
    }
  });

// Update user progress
export const updateUserProgress = createServerFn({ method: "POST" })
  .validator(
    (data: {
      subject: SubjectEnum;
      action: "task" | "hint" | "concept" | "practice" | "quiz";
    }) => data
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      // Check if progress record exists
      const [existingProgress] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, user.id),
            eq(userProgress.subject, data.subject)
          )
        );

      if (existingProgress) {
        // Update existing progress
        const updates: Partial<typeof userProgress.$inferSelect> = {
          lastActivity: new Date(),
          updatedAt: new Date(),
        };

        switch (data.action) {
          case "task":
            updates.tasksAttempted = String(
              parseInt(existingProgress.tasksAttempted) + 1
            );
            break;
          case "hint":
            updates.hintsUsed = String(
              parseInt(existingProgress.hintsUsed) + 1
            );
            break;
          case "concept":
            updates.conceptsLearned = String(
              parseInt(existingProgress.conceptsLearned) + 1
            );
            break;
          case "practice":
            updates.practiceCompleted = String(
              parseInt(existingProgress.practiceCompleted) + 1
            );
            break;
          case "quiz":
            updates.quizzesTaken = String(
              parseInt(existingProgress.quizzesTaken) + 1
            );
            break;
        }

        const [updatedProgress] = await db
          .update(userProgress)
          .set(updates)
          .where(eq(userProgress.id, existingProgress.id))
          .returning();

        return updatedProgress;
      } else {
        // Create new progress record
        const newProgress: typeof userProgress.$inferInsert = {
          userId: user.id,
          subject: data.subject,
          tasksAttempted: data.action === "task" ? "1" : "0",
          hintsUsed: data.action === "hint" ? "1" : "0",
          conceptsLearned: data.action === "concept" ? "1" : "0",
          practiceCompleted: data.action === "practice" ? "1" : "0",
          quizzesTaken: data.action === "quiz" ? "1" : "0",
        };

        const [progress] = await db
          .insert(userProgress)
          .values(newProgress)
          .returning();

        return progress;
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw new Error("Failed to update user progress");
    }
  });

// Get user progress summary
export const getUserProgressSummary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<UserProgressSummary> => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      const progressRecords = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, user.id));

      const summary: UserProgressSummary = {
        totalTasks: 0,
        totalHints: 0,
        totalConcepts: 0,
        totalPractice: 0,
        totalQuizzes: 0,
        subjectBreakdown: {},
      };

      progressRecords.forEach((record) => {
        const tasks = parseInt(record.tasksAttempted);
        const hints = parseInt(record.hintsUsed);
        const concepts = parseInt(record.conceptsLearned);
        const practice = parseInt(record.practiceCompleted);
        const quizzes = parseInt(record.quizzesTaken);

        summary.totalTasks += tasks;
        summary.totalHints += hints;
        summary.totalConcepts += concepts;
        summary.totalPractice += practice;
        summary.totalQuizzes += quizzes;

        summary.subjectBreakdown[record.subject] = {
          tasks,
          hints,
          concepts,
          practice,
          quizzes,
        };
      });

      return summary;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      throw new Error("Failed to fetch user progress");
    }
  });

// Update session title
export const updateSessionTitle = createServerFn({ method: "POST" })
  .validator((data: { sessionId: string; title: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      const [updatedSession] = await db
        .update(chatSessions)
        .set({
          title: data.title,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(chatSessions.id, data.sessionId),
            eq(chatSessions.userId, user.id)
          )
        )
        .returning();

      if (!updatedSession) {
        throw new Error("Session not found");
      }

      return updatedSession;
    } catch (error) {
      console.error("Error updating session title:", error);
      throw new Error("Failed to update session title");
    }
  });

// End/deactivate a session
export const endChatSession = createServerFn({ method: "POST" })
  .validator((sessionId: string) => sessionId)
  .middleware([authMiddleware])
  .handler(async ({ data: sessionId }) => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      const [updatedSession] = await db
        .update(chatSessions)
        .set({
          isActive: "false",
          updatedAt: new Date(),
        })
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id))
        )
        .returning();

      if (!updatedSession) {
        throw new Error("Session not found");
      }

      return updatedSession;
    } catch (error) {
      console.error("Error ending chat session:", error);
      throw new Error("Failed to end chat session");
    }
  });

export const deleteChatSession = createServerFn({ method: "POST" })
  .validator((sessionId: string) => sessionId)
  .middleware([authMiddleware])
  .handler(async ({ data: sessionId }) => {
    const user = await getUser();

    if (!user) {
      throw new Error("User not found");
    }

    try {
      const [deletedSession] = await db
        .delete(chatSessions)
        .where(
          and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id))
        )
        .returning();

      if (!deletedSession) {
        throw new Error("Session not found");
      }

      return deletedSession;
    } catch (error) {
      console.error("Error deleting chat session:", error);
      throw new Error("Failed to delete chat session");
    }
  });
