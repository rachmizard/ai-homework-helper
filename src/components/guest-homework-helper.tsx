import { SignInButton, useAuth } from "@clerk/tanstack-react-start";
import {
  Brain,
  CheckCircle2,
  History,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import Aurora from "~/components/backgrounds/Aurora/Aurora";
import type { ChatMessage } from "~/components/chat-interface";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { InputMethodEnum, ModeEnum, SubjectEnum } from "~/db";
import {
  useStreamingAI,
  useSubjectDetection,
  type StreamingMode,
} from "~/hooks/use-streaming-ai";
import {
  useAddGuestMessage,
  useClearGuestMessages,
  useGetGuestMessagesBySessionId,
  useGuestMessages,
} from "~/store/guest-chat-messages";
import {
  useClearGuestSession,
  useCreateGuestSession,
  useGuestChatSession,
  useHasGuestSession,
  useUpdateGuestSession,
} from "~/store/guest-chat-sessions";

const ChatInterface = React.lazy(() => import("~/components/chat-interface"));

type Mode = ModeEnum;

export function GuestHomeworkHelper() {
  const { isSignedIn } = useAuth();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [textInput, setTextInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [inputMethod, setInputMethod] = React.useState<InputMethodEnum | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] = React.useState<string>("");
  const [extractedText, setExtractedText] = React.useState<string>("");
  const [sessionTitle, setSessionTitle] = React.useState("");
  const [isSessionTitleSubmitted, setIsSessionTitleSubmitted] =
    React.useState(false);

  // AI-based subject detection
  const {
    detectedSubject,
    isDetecting,
    detectSubject: detectSubjectAI,
    resetSubject,
  } = useSubjectDetection();

  // Streaming AI hook
  const {
    isStreaming,
    streamingContent,
    streamingType,
    startStream,
    resetStream,
  } = useStreamingAI();

  // Guest session management
  const guestSession = useGuestChatSession();
  const createGuestSession = useCreateGuestSession();
  const clearGuestSession = useClearGuestSession();
  const hasGuestSession = useHasGuestSession();
  const updateGuestSession = useUpdateGuestSession();

  // Guest messages management
  const allGuestMessages = useGuestMessages();
  const addGuestMessage = useAddGuestMessage();
  const getGuestMessagesBySessionId = useGetGuestMessagesBySessionId();
  const clearGuestMessages = useClearGuestMessages();

  console.log({
    allGuestMessages,
    guestSession,
  });

  // Get messages for current session
  const messages: ChatMessage[] = React.useMemo(() => {
    if (!guestSession?.id) return [];

    const sessionMessages = getGuestMessagesBySessionId(guestSession.id);
    return sessionMessages.map((msg) => ({
      id: msg.id,
      type: msg.type as "user" | "assistant",
      content: msg.content,
      timestamp: msg.createdAt || new Date(),
      mode: msg.mode as Mode | undefined,
    }));
  }, [guestSession?.id, allGuestMessages, getGuestMessagesBySessionId]);

  console.log({
    messages,
  });

  // Update session title when guestSession changes
  React.useEffect(() => {
    if (guestSession?.title) {
      setSessionTitle(guestSession.title);
      setIsSessionTitleSubmitted(true);
    }
  }, [guestSession?.title]);

  const handleSessionNameSubmit = () => {
    if (!sessionTitle.trim()) {
      toast.error("Please enter a session name");
      return;
    }

    // Check if user already has a session
    if (hasGuestSession()) {
      toast.error(
        "You can only have one session as a guest. Please sign in to create multiple sessions."
      );
      return;
    }

    setSessionTitle(sessionTitle);
    setIsSessionTitleSubmitted(true);
    toast.success("Session name set! You can now start your homework session.");
  };

  const handleFileSelect = async (file: File) => {
    if (!sessionTitle) {
      toast.error("Please set a session name first");
      return;
    }

    setSelectedFile(file);
    setInputMethod("photo");
    setTextInput("");

    // Simulate OCR processing (in real implementation, this would call OCR service)
    setTimeout(async () => {
      const mockExtractedText = "Solve: 2x + 3 = 7";
      setExtractedText(mockExtractedText);
      setCurrentQuestion(mockExtractedText);
      await detectSubjectAI(mockExtractedText);

      // Create new session if none exists
      if (!guestSession) {
        await createNewSession({
          originalInput: mockExtractedText,
          inputMethod: "photo",
          subject: detectedSubject || "math",
        });
      }
    }, 1000);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setInputMethod(null);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    if (!sessionTitle) {
      toast.error("Please set a session name first");
      return;
    }

    setInputMethod("text");
    setSelectedFile(null);
    setCurrentQuestion(textInput);
    setExtractedText("");
    const subjectResponse = await detectSubjectAI(textInput);

    if (!subjectResponse?.subject) {
      toast.error("Failed to detect subject. Please try again.");
      return;
    }

    // Create new session if none exists
    const session = await createNewSession({
      originalInput: textInput,
      inputMethod: "text",
      subject: subjectResponse?.subject,
    });

    if (!session) {
      toast.error("Failed to create session. Please try again.");
      return;
    }

    try {
      addGuestMessage({
        sessionId: session.id,
        type: "user",
        content: textInput,
        mode: "chat",
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleDirectChatMessage = async (message: string) => {
    if (!message.trim() || !sessionTitle || !guestSession) return;

    addGuestMessage({
      sessionId: guestSession.id,
      type: "user",
      content: message,
    });

    // Update current question context for AI responses
    setCurrentQuestion(message);

    // Generate AI response using the current context
    setIsProcessing(true);
    resetStream();

    try {
      // Convert chat messages to the format expected by the AI
      const conversationHistory = messages.map((msg) => ({
        role: msg.type as "user" | "assistant",
        content: msg.content,
      }));

      // Start streaming AI response with conversation history
      await startStream("chat" as StreamingMode, {
        language: "en",
        messages: conversationHistory,
      });

      setIsProcessing(false);
    } catch (error) {
      console.error("Error handling direct chat message:", error);
      setIsProcessing(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const createNewSession = async ({
    originalInput,
    inputMethod,
    subject,
  }: {
    originalInput: string;
    inputMethod: InputMethodEnum;
    subject: SubjectEnum;
  }) => {
    // Wait for AI detection to complete if it's still in progress
    if (isDetecting) {
      // Wait a bit for detection to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const session = createGuestSession({
        title: sessionTitle,
        subject: subject as "math" | "science" | "writing" | "summary",
        inputMethod,
        originalInput,
        extractedText: inputMethod === "photo" ? originalInput : undefined,
        isActive: true,
      });

      return session;
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const saveChatMessage = async (
    type: "user" | "assistant",
    content: string,
    mode?: Mode
  ) => {
    if (!guestSession?.id) return;

    try {
      addGuestMessage({
        sessionId: guestSession.id,
        type,
        content,
        mode: mode || undefined,
        metadata: undefined,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Template messages for different modes
  const getTemplateMessage = (mode: Mode): string => {
    const templates = {
      hint: `💡 **Hint Request**\n\nI need a helpful hint to guide me through this problem without giving away the complete answer. Can you provide a strategic hint that will help me think through this step by step?`,
      concept: `🧠 **Concept Learning Request**\n\nI'd like to understand the underlying concepts and principles related to this topic. Can you explain the key concepts in a clear and engaging way?`,
      practice: `🔄 **Practice Request**\n\nI want to practice and reinforce my knowledge. Can you give me a practice problem or exercise related to this topic so I can test my understanding?`,
      quiz: `✅ **Quiz Request**\n\nI'm ready to test my knowledge! Can you create a short quiz with questions related to this topic to help me assess my understanding?`,
      chat: `💬 **Chat Conversation**\n\nLet's have a conversation about this topic. I'm ready to discuss, ask questions, and learn more through our chat!`,
    };

    return templates[mode];
  };

  const handleModeSelect = async (mode: Mode) => {
    if (!guestSession?.subject) return;

    setIsProcessing(true);

    try {
      // Get template message
      const templateMessage = getTemplateMessage(mode);

      // Add user message with template
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: templateMessage,
        timestamp: new Date(),
        mode,
      };

      // Save user message to store first
      if (guestSession.id) {
        saveChatMessage("user", templateMessage, mode);
      }

      resetStream();
      await startStream(mode as StreamingMode, {
        language: "en",
        extractedText: extractedText || undefined,
        messages: [...messages, userMessage].map((msg) => ({
          role: msg.type as "user" | "assistant",
          content: msg.content,
        })),
      });

      setIsProcessing(false);
    } catch (error) {
      console.error("Error handling mode select:", error);
      setIsProcessing(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleNewSession = () => {
    // Reset all chat session & messages, and started to beginning
    clearGuestSession();
    clearGuestMessages();
    setSessionTitle("");
    setIsSessionTitleSubmitted(false);
    setInputMethod(null);
    setSelectedFile(null);
    setTextInput("");
    setCurrentQuestion("");
    setExtractedText("");
    resetSubject();
    toast.success("Ready for a new homework session! ✨");
  };

  const handleSaveSession = async () => {
    if (!guestSession) return;

    try {
      updateGuestSession({
        isActive: false,
      });
      toast.success("Session saved! Sign in to access it later.");
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  // Handle stream completion - add final message to chat
  React.useEffect(() => {
    if (streamingContent && streamingType && !isStreaming) {
      // Save to store - the UI will update automatically
      if (guestSession?.id) {
        saveChatMessage("assistant", streamingContent, streamingType as Mode);
      }

      // Reset streaming state
      setTimeout(() => {
        resetStream();
      }, 1000);
    }
  }, [isStreaming, streamingContent, streamingType, guestSession?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 z-0">
          <Suspense
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
            }
          >
            <Aurora
              colorStops={["#9333ea", "#ec4899", "#3b82f6"]}
              amplitude={1.5}
              blend={0.8}
              speed={0.5}
            />
          </Suspense>
        </div>

        <div className="container mx-auto px-4 pt-16 pb-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                AI Homework Helper
              </span>
              <span className="ml-3">🚀</span>
            </h1>
            <p className="text-md md:text-lg text-foreground max-w-2xl mx-auto leading-relaxed">
              Get instant hints, learn concepts, practice problems, and test
              your knowledge! No direct answers - just smart guidance to help
              you learn. 🧠✨
            </p>
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Guest Mode - Limited to 1 session
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="container mx-auto px-4 mb-4 relative z-10">
        <div className="flex gap-2 items-center justify-between flex-wrap mb-4">
          <div className="flex gap-2 items-center">
            {allGuestMessages.length > 0 && (
              <Button
                onClick={handleNewSession}
                variant="outline"
                size="sm"
                className="hover:border-green-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            )}

            {guestSession && (
              <Button
                onClick={handleSaveSession}
                variant="outline"
                size="sm"
                className="hover:border-blue-500"
              >
                <History className="h-4 w-4 mr-2" />
                Save Session
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <Button variant="default" size="sm">
                  Sign In to Save Progress
                </Button>
              </SignInButton>
            )}
          </div>
        </div>

        {guestSession && (
          <div className="p-3 bg-muted rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Session:</span>
              <span className="text-sm">{guestSession.title}</span>
              <Badge variant="default" className="ml-2">
                {guestSession.subject.charAt(0).toUpperCase() +
                  guestSession.subject.slice(1)}
              </Badge>
              <Badge variant="outline" className="ml-2">
                Guest Mode
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Chat Interface */}
      <div className="container mx-auto px-4 pb-8 relative z-10">
        <Card className="flex-1 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Your Learning Journey 🎯</CardTitle>
            <CardDescription>
              {!isSessionTitleSubmitted
                ? "Set a session name to start your learning journey!"
                : "I'm here to guide you! Ask questions, have conversations, and get help. Sign in to save your progress permanently."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <Suspense
              fallback={
                <div className="w-full h-full bg-muted animate-pulse" />
              }
            >
              <ChatInterface
                messages={messages}
                className="h-full"
                streamingMessage={
                  isStreaming && streamingContent && streamingType
                    ? {
                        content: streamingContent,
                        type: streamingType,
                        isComplete: false,
                      }
                    : undefined
                }
                onSendMessage={handleDirectChatMessage}
                isStreaming={isStreaming}
                showInput={!!isSessionTitleSubmitted && messages.length > 0}
                // Enhanced props for integrated input functionality
                sessionTitle={sessionTitle}
                onSessionTitleChange={setSessionTitle}
                onSessionTitleSubmit={handleSessionNameSubmit}
                inputMethod={inputMethod}
                onInputMethodChange={setInputMethod}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                textInput={textInput}
                onTextInputChange={setTextInput}
                onTextSubmit={handleTextSubmit}
                isDetecting={isDetecting}
                detectedSubject={detectedSubject}
                isSessionTitleSubmitted={isSessionTitleSubmitted}
              />
            </Suspense>

            {/* Action Buttons */}
            {messages.length > 0 && (
              <div className="p-4 border-t bg-muted/30">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("hint")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-yellow-500 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ask for Hint 💡
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("concept")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-blue-500 disabled:opacity-50"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Learn Concepts 🧠
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("practice")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-green-500 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Get Practice 🔄
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("quiz")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-rose-500 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Take Quiz ✅
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
