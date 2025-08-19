import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  CheckCircle2,
  History,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash,
} from "lucide-react";
import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { SubjectEnum } from "~/db";
import {
  useAddChatMessage,
  useChatSession,
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useEndChatSession,
  useUpdateSessionTitle,
  useUpdateUserProgress,
} from "~/hooks/use-chat-history";
import {
  useStreamingAI,
  useSubjectDetection,
  type StreamingMode,
} from "~/hooks/use-streaming-ai";
import { useUser } from "~/hooks/use-user";
import { useGetChatSession, useSetChatSession } from "~/store/chat-session";
// Lazy load heavy background component
const Aurora = React.lazy(
  () => import("~/components/backgrounds/Aurora/Aurora")
);

// Lazy load the chat interface component
const ChatInterface = React.lazy(() => import("~/components/chat-interface"));

export const Route = createFileRoute("/_authenticatedLayout/homework-helper")({
  component: HomeworkHelper,
});

type Mode = "hint" | "concept" | "practice" | "quiz" | "chat";

function HomeworkHelper() {
  const user = useUser();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [textInput, setTextInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  // AI-based subject detection
  const {
    detectedSubject,
    isDetecting,
    detectSubject: detectSubjectAI,
    resetSubject,
  } = useSubjectDetection();
  const [inputMethod, setInputMethod] = React.useState<"photo" | "text" | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] = React.useState<string>("");
  const [extractedText, setExtractedText] = React.useState<string>("");

  // Streaming AI hook
  const {
    isStreaming,
    streamingContent,
    streamingType,
    startStream,
    resetStream,
  } = useStreamingAI();

  // Chat session management
  const currentSessionId = useGetChatSession();
  const setCurrentSessionId = useSetChatSession();

  const [sessionTitle, setSessionTitle] = React.useState("");
  const [isSessionTitleSubmitted, setIsSessionTitleSubmitted] =
    React.useState(false);

  // TanStack Query hooks
  const { data: userSessions, isLoading: loadingSessions } = useChatSessions();
  const { data: currentSessionData, isLoading: isLoadingCurrentSession } =
    useChatSession(currentSessionId);
  const createSessionMutation = useCreateChatSession();
  const deleteSessionMutation = useDeleteChatSession();
  const addMessageMutation = useAddChatMessage();
  const updateProgressMutation = useUpdateUserProgress();
  const updateTitleMutation = useUpdateSessionTitle();
  const endSessionMutation = useEndChatSession();

  // Derive messages directly from currentSessionData
  const messages: ChatMessage[] = React.useMemo(() => {
    if (!currentSessionData?.messages) return [];

    return currentSessionData.messages.map((msg: any) => ({
      id: msg.id,
      type: msg.type as "user" | "assistant",
      content: msg.content,
      timestamp: new Date(msg.createdAt),
      mode: msg.mode as Mode | undefined,
    }));
  }, [currentSessionData?.messages]);

  // Update session title when currentSessionData changes
  React.useEffect(() => {
    if (currentSessionData?.title) {
      setSessionTitle(currentSessionData.title);
      setIsSessionTitleSubmitted(true);
    }
  }, [currentSessionData?.title]);

  const handleSessionNameSubmit = () => {
    if (!sessionTitle.trim()) {
      toast.error("Please enter a session name");
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
      // TODO: Will be updated later
      // if (!currentSessionId) {
      //   await createNewSession({
      //     originalInput: mockExtractedText,
      //     inputMethod: "photo",
      //     subject: detectedSubject,
      //   });
      // }
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

    // Add message to existing session
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
      await addMessageMutation.mutateAsync({
        sessionId: session?.id || "",
        ...{
          type: "user",
          content: textInput,
          mode: "chat",
        },
      });
    } catch (error) {
      console.error("Error saving message:", error);
      // Don't show error toast for message saving failures as it might be disruptive
    }
  };

  const handleDirectChatMessage = async (message: string) => {
    if (!message.trim() || !sessionTitle) return;

    await saveChatMessage("user", message);

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
        question: message,
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
    inputMethod: "photo" | "text";
    subject: SubjectEnum;
  }) => {
    // Wait for AI detection to complete if it's still in progress
    if (isDetecting) {
      // Wait a bit for detection to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!user || !user.data) return;

    try {
      const session = await createSessionMutation.mutateAsync({
        userId: user.data.id,
        title: sessionTitle, // Use the session name that was set
        subject: subject as "math" | "science" | "writing" | "summary",
        inputMethod,
        originalInput,
        extractedText: inputMethod === "photo" ? originalInput : null,
      });

      setCurrentSessionId(session.id);

      // Update progress for new task
      updateProgressMutation.mutate({
        subject: subject as "math" | "science" | "writing" | "summary",
        action: "task",
      });

      return session;
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const loadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    toast.success("Session loaded! 📖");
  };

  const saveChatMessage = async (
    type: "user" | "assistant",
    content: string,
    mode?: Mode
  ) => {
    if (!currentSessionId) return;

    try {
      await addMessageMutation.mutateAsync({
        sessionId: currentSessionId,
        ...{
          type,
          content,
          mode: mode || undefined,
          metadata: undefined,
        },
      });
    } catch (error) {
      console.error("Error saving message:", error);
      // Don't show error toast for message saving failures as it might be disruptive
    }
  };

  // AI-based subject detection is now handled by the useSubjectDetection hook

  // Template messages for different modes
  const getTemplateMessage = (mode: Mode): string => {
    const questionContext = currentQuestion
      ? `\n\n**My question/topic:** ${currentQuestion}`
      : "";

    const templates = {
      hint: `💡 **Hint Request**${questionContext}\n\nI need a helpful hint to guide me through this problem without giving away the complete answer. Can you provide a strategic hint that will help me think through this step by step?`,
      concept: `🧠 **Concept Learning Request**${questionContext}\n\nI'd like to understand the underlying concepts and principles related to this topic. Can you explain the key concepts in a clear and engaging way?`,
      practice: `🔄 **Practice Request**${questionContext}\n\nI want to practice and reinforce my knowledge. Can you give me a practice problem or exercise related to this topic so I can test my understanding?`,
      quiz: `✅ **Quiz Request**${questionContext}\n\nI'm ready to test my knowledge! Can you create a short quiz with questions related to this topic to help me assess my understanding?`,
      chat: `💬 **Chat Conversation**${questionContext}\n\nLet's have a conversation about this topic. I'm ready to discuss, ask questions, and learn more through our chat!`,
    };

    return templates[mode];
  };

  const handleModeSelect = async (mode: Mode) => {
    if (!currentSessionData?.subject || !currentQuestion) return;

    setIsProcessing(true);

    try {
      // Update progress
      updateProgressMutation.mutate({
        subject: currentSessionData?.subject as SubjectEnum,
        action: mode as "hint" | "concept" | "practice" | "quiz" | "task",
      });

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

      // Save user message to database first
      if (currentSessionId) {
        saveChatMessage("user", templateMessage, mode);
      }

      resetStream();
      if (!detectedSubject) {
        toast.error("Failed to detect subject. Please try again.");
        return;
      }
      await startStream(mode as StreamingMode, {
        question: currentQuestion,
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
    setCurrentSessionId(null);
    resetSubject();
    setInputMethod(null);
    setSelectedFile(null);
    setTextInput("");
    setSessionTitle("");
    setCurrentQuestion("");
    setExtractedText("");
    resetSubject();
    setIsSessionTitleSubmitted(false);
    toast.success("Ready for a new homework session! ✨");
  };

  const handleSaveSession = async () => {
    if (!currentSessionId || !sessionTitle) return;

    try {
      await updateTitleMutation.mutateAsync({
        sessionId: currentSessionId,
        title: sessionTitle,
      });

      await endSessionMutation.mutateAsync(currentSessionId);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  // Handle stream completion - add final message to chat
  React.useEffect(() => {
    if (streamingContent && streamingType && !isStreaming) {
      // Save to database - the UI will update automatically via React Query
      if (currentSessionId) {
        saveChatMessage("assistant", streamingContent, streamingType as Mode);
      }

      // Reset streaming state
      setTimeout(() => {
        resetStream();
      }, 1000);
    }
  }, [isStreaming, streamingContent, streamingType, currentSessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 z-0">
          <Suspense
            fallback={
              <Spinner className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
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

        <div className="container mx-auto px-4 pt-8 pb-4 relative z-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                AI Homework Helper
              </span>
              <span className="ml-3">🚀</span>
            </h1>
            <p className="text-sm md:text-base text-foreground max-w-2xl mx-auto leading-relaxed">
              Get instant hints, learn concepts, practice problems, and test
              your knowledge! Your progress is automatically saved. 🧠✨
            </p>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="container mx-auto px-4 mb-4 relative z-10">
        <div className="flex gap-2 items-center justify-between flex-wrap mb-4">
          <div className="flex gap-2 items-center">
            <Button
              onClick={handleNewSession}
              variant="outline"
              size="sm"
              className="hover:border-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>

            {currentSessionId && (
              <Button
                onClick={handleSaveSession}
                variant="outline"
                size="sm"
                className="hover:border-blue-500"
                disabled={
                  updateTitleMutation.isPending || endSessionMutation.isPending
                }
              >
                <Save className="h-4 w-4 mr-2" />
                Save Session
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userSessions && userSessions.length > 0 && (
              <Select
                value={currentSessionId || undefined}
                onValueChange={loadSession}
                disabled={loadingSessions}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue
                    placeholder={
                      loadingSessions
                        ? "Loading..."
                        : "Load previous session..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {userSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        <span className="truncate">{session.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {currentSessionId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        deleteSessionMutation.mutate(currentSessionId, {
                          onSuccess: () => {
                            const latestSession =
                              userSessions?.[userSessions.length - 1];

                            if (latestSession) {
                              setCurrentSessionId(latestSession.id);
                              setSessionTitle(latestSession.title);
                              setIsSessionTitleSubmitted(true);
                            } else {
                              setCurrentSessionId(null);
                              setCurrentQuestion("");
                              setExtractedText("");
                              setTextInput("");
                              setSelectedFile(null);
                              setInputMethod(null);
                              setSessionTitle("");
                              resetSubject();
                            }
                            toast.success("Session deleted! 💾");
                          },
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Session</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {currentSessionData && (
          <div className="p-3 bg-muted rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Session:</span>
              <span className="text-sm">{currentSessionData.title}</span>
              <Badge variant="default" className="ml-2">
                {currentSessionData.subject.charAt(0).toUpperCase() +
                  currentSessionData.subject.slice(1)}
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
                : "I'm here to guide you! Ask questions, have conversations, and get help. Your progress is saved automatically."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {isLoadingCurrentSession && (
              <div className="flex items-center justify-center h-full my-4">
                <Spinner className="w-full h-full" />
              </div>
            )}

            {!isLoadingCurrentSession && (
              <Suspense fallback={<Spinner className="w-full h-full" />}>
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
            )}

            {/* Action Buttons */}
            {messages.length > 0 && !isLoadingCurrentSession && (
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
