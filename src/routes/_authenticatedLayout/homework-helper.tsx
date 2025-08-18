import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Camera,
  CheckCircle2,
  RefreshCw,
  Send,
  Sparkles,
  Type,
  History,
  Save,
  Plus,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import Aurora from "~/components/backgrounds/Aurora/Aurora";
import { ChatInterface, ChatMessage } from "~/components/chat-interface";
import { FileUpload } from "~/components/file-upload";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  useChatSessions,
  useChatSession,
  useCreateChatSession,
  useAddChatMessage,
  useUpdateUserProgress,
  useUpdateSessionTitle,
  useEndChatSession,
} from "~/hooks/use-chat-history";
import { useUser } from "~/hooks/use-user";
import {
  useStreamingAI,
  type StreamingMode,
  useSubjectDetection,
} from "~/hooks/use-streaming-ai";

export const Route = createFileRoute("/_authenticatedLayout/homework-helper")({
  component: HomeworkHelper,
});

type Subject = "math" | "science" | "writing" | "summary";
type Mode = "hint" | "concept" | "practice" | "quiz";

function HomeworkHelper() {
  const user = useUser();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [textInput, setTextInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
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
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    null
  );
  const [sessionTitle, setSessionTitle] = React.useState("");

  // TanStack Query hooks
  const { data: userSessions, isLoading: loadingSessions } = useChatSessions();
  const { data: currentSessionData } = useChatSession(currentSessionId);
  const createSessionMutation = useCreateChatSession();
  const addMessageMutation = useAddChatMessage();
  const updateProgressMutation = useUpdateUserProgress();
  const updateTitleMutation = useUpdateSessionTitle();
  const endSessionMutation = useEndChatSession();

  // Update messages when session data changes
  React.useEffect(() => {
    if (currentSessionData && currentSessionData.messages) {
      const chatMessages: ChatMessage[] = currentSessionData.messages.map(
        (msg: any) => ({
          id: msg.id,
          type: msg.type as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          mode: msg.mode as Mode | undefined,
        })
      );
      setMessages(chatMessages);
      setSessionTitle(currentSessionData.title);
      // Note: We don't set detectedSubject here as it's managed by the AI detection hook
      // The subject will be detected when the user interacts with the content
    }
  }, [currentSessionData]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setInputMethod("photo");
    setTextInput("");

    // Simulate OCR processing (in real implementation, this would call OCR service)
    setTimeout(async () => {
      const mockExtractedText = "Solve: 2x + 3 = 7";
      setExtractedText(mockExtractedText);
      setCurrentQuestion(mockExtractedText);
      addMessageToChat("user", `📸 Photo uploaded: "${mockExtractedText}"`);
      await detectSubjectAI(mockExtractedText);

      // Create new session if none exists
      if (!currentSessionId) {
        await createNewSession(mockExtractedText, "photo");
      }
    }, 1000);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setInputMethod(null);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setInputMethod("text");
    setSelectedFile(null);
    setCurrentQuestion(textInput);
    setExtractedText("");
    addMessageToChat("user", textInput);
    await detectSubjectAI(textInput);

    // Create new session if none exists
    if (!currentSessionId) {
      await createNewSession(textInput, "text");
    } else {
      // Add message to existing session
      await saveChatMessage("user", textInput);
    }

    setTextInput("");
  };

  const createNewSession = async (
    originalInput: string,
    inputMethod: "photo" | "text"
  ) => {
    // Wait for AI detection to complete if it's still in progress
    if (isDetecting) {
      // Wait a bit for detection to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!detectedSubject) {
      toast.error("Subject detection failed. Please try again.");
      return;
    }

    const title = generateSessionTitle(originalInput);

    if (!user || !user.data) return;

    try {
      const session = await createSessionMutation.mutateAsync({
        userId: user.data.id,
        title,
        subject: detectedSubject,
        inputMethod,
        originalInput,
        extractedText: inputMethod === "photo" ? originalInput : null,
      });

      setCurrentSessionId(session.id);
      setSessionTitle(title);

      // Update progress for new task
      updateProgressMutation.mutate({
        subject: detectedSubject,
        action: "task",
      });
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

  const generateSessionTitle = (input: string): string => {
    const truncated =
      input.length > 50 ? input.substring(0, 50) + "..." : input;
    const timestamp = new Date().toLocaleDateString();
    return `${truncated} - ${timestamp}`;
  };

  // AI-based subject detection is now handled by the useSubjectDetection hook

  const addMessageToChat = (
    type: "user" | "assistant",
    content: string,
    mode?: Mode
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      mode,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleModeSelect = async (mode: Mode) => {
    if (!detectedSubject || !currentQuestion) return;

    setIsProcessing(true);
    resetStream();

    try {
      // Update progress
      updateProgressMutation.mutate({
        subject: detectedSubject,
        action: mode,
      });

      // Start streaming AI response
      await startStream(mode as StreamingMode, {
        question: currentQuestion,
        subject: detectedSubject,
        extractedText: extractedText || undefined,
      });

      setIsProcessing(false);
    } catch (error) {
      console.error("Error handling mode select:", error);
      setIsProcessing(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Handle stream completion - add final message to chat
  React.useEffect(() => {
    if (streamingContent && streamingType && !isStreaming) {
      // Stream is complete, add the final message to chat
      const finalMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: streamingContent,
        timestamp: new Date(),
        mode: streamingType,
        isComplete: true,
      };

      setMessages((prev) => [...prev, finalMessage]);

      // Save to database
      if (currentSessionId) {
        saveChatMessage("assistant", streamingContent, streamingType);
      }

      // Reset streaming state
      setTimeout(() => {
        resetStream();
      }, 1000);
    }
  }, [isStreaming, streamingContent, streamingType, currentSessionId]);

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    resetSubject();
    setInputMethod(null);
    setSelectedFile(null);
    setTextInput("");
    setSessionTitle("");
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

  // Response generators (same as original)
  const getHintResponse = (subject: Subject) => {
    const hints: Record<string, string> = {
      math: "💡 Try isolating x by subtracting 3 from both sides first. What do you get? 🤔",
      science:
        "💡 Remember the scientific method: Observation → Hypothesis → Experiment → Conclusion! 🔬",
      writing:
        "💡 Start with a hook that grabs attention! Try a surprising fact or a thought-provoking question. ✍️",
      summary:
        "💡 Look for the topic sentence in each paragraph - they usually contain the main ideas! 📝",
    };
    return hints[subject];
  };

  const getConceptResponse = (subject: Subject) => {
    const concepts: Record<string, string> = {
      math: "🧠 This is a linear equation! Think of it like a balance scale - whatever you do to one side, you must do to the other to keep it balanced. ⚖️\n\nThe goal is to get x by itself on one side!",
      science:
        "🧠 The scientific method is a systematic way to understand the world. It's like being a detective - you observe clues, make educated guesses, and test them! 🔍",
      writing:
        "🧠 A strong essay has three parts: Introduction (with thesis), Body (with evidence), and Conclusion. Think of it as telling a story with a beginning, middle, and end! 📖",
      summary:
        "🧠 Summarizing means capturing the BIG ideas in fewer words. Skip the details and examples - focus on what the author is really trying to say! ✂️",
    };
    return concepts[subject];
  };

  const getPracticeResponse = (subject: Subject) => {
    const practice: Record<string, string> = {
      math: "🔄 Let's practice! Try this similar problem:\n\nSolve: 4x - 5 = 11\n\nRemember the steps we just learned! You got this! 💪",
      science:
        "🔄 Practice time! Design a simple experiment:\n\nQuestion: Does music affect plant growth?\nNow create your hypothesis and experimental design! 🌱",
      writing:
        "🔄 Your turn! Write an introduction paragraph for:\n\n'The importance of protecting our oceans'\n\nDon't forget your hook and thesis statement! 🌊",
      summary:
        "🔄 Practice summarizing this:\n\n'The Amazon rainforest produces 20% of Earth's oxygen, houses millions of species, and influences global weather patterns. However, deforestation threatens this vital ecosystem.'\n\nSummarize in one sentence! 🌳",
    };
    return practice[subject];
  };

  const getQuizResponse = (subject: Subject) => {
    const quiz: Record<string, string> = {
      math: "✅ Quick Quiz!\n\nWhat's the first step in solving 3x + 9 = 15?\n\nA) Divide by 3\nB) Subtract 9 from both sides\nC) Add 9 to both sides\nD) Multiply by 3\n\nThink carefully! 🤓",
      science:
        "✅ Quiz Time!\n\nWhat comes after forming a hypothesis?\n\nA) Write conclusion\nB) Make observation\nC) Conduct experiment\nD) Ask a question\n\nYou know this! 🧪",
      writing:
        "✅ Quick Check!\n\nWhat makes a good hook?\n\nA) Long explanation\nB) Boring fact\nC) Surprising statement\nD) Dictionary definition\n\nPick the best one! ✨",
      summary:
        "✅ Test yourself!\n\nWhen summarizing, you should:\n\nA) Include every detail\nB) Add your opinions\nC) Focus on main ideas\nD) Make it longer\n\nChoose wisely! 📚",
    };
    return quiz[subject];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 z-0">
          <Aurora
            colorStops={["#9333ea", "#ec4899", "#3b82f6"]}
            amplitude={1.5}
            blend={0.8}
            speed={0.5}
          />
        </div>

        <div className="container mx-auto px-4 pt-8 pb-4 relative z-10">
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
        <div className="flex gap-2 items-center justify-between mb-4">
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

          {userSessions && userSessions.length > 0 && (
            <Select onValueChange={loadSession} disabled={loadingSessions}>
              <SelectTrigger className="w-[300px]">
                <SelectValue
                  placeholder={
                    loadingSessions ? "Loading..." : "Load previous session..."
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
        </div>

        {currentSessionData && (
          <div className="p-3 bg-muted rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Session:</span>
              <span className="text-sm">{currentSessionData.title}</span>
              <Badge variant="secondary" className="ml-2">
                {currentSessionData.subject.charAt(0).toUpperCase() +
                  currentSessionData.subject.slice(1)}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Main Interface */}
      <div className="container mx-auto px-4 pb-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Upload Your Homework 📚</CardTitle>
              <CardDescription>
                Take a photo or type your question to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input Method Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={inputMethod === "photo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMethod("photo")}
                  className="flex-1 transition-all duration-300"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant={inputMethod === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMethod("text")}
                  className="flex-1 transition-all duration-300"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </Button>
              </div>

              {/* File Upload */}
              {inputMethod === "photo" && (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                />
              )}

              {/* Text Input */}
              {inputMethod === "text" && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type or paste your homework question here... 🤔"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleTextSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Question
                  </Button>
                </div>
              )}

              {/* Subject Detection */}
              {isDetecting && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-sm">AI is detecting subject...</span>
                </div>
              )}
              {detectedSubject && !isDetecting && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI detected subject:</span>
                  <Badge variant="secondary">
                    {detectedSubject.charAt(0).toUpperCase() +
                      detectedSubject.slice(1)}
                  </Badge>
                </div>
              )}

              {/* Action Buttons */}
              {messages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("hint")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-yellow-500 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Hint 💡
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("concept")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-blue-500 disabled:opacity-50"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Learn Concept 🧠
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("practice")}
                    disabled={isProcessing || isStreaming}
                    className="hover:border-green-500 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Practice 🔄
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
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Your Learning Journey 🎯</CardTitle>
              <CardDescription>
                I'm here to guide you, not give you answers! Your progress is
                saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ChatInterface
                messages={messages}
                className="h-full overflow-y-auto"
                streamingMessage={
                  isStreaming && streamingContent && streamingType
                    ? {
                        content: streamingContent,
                        type: streamingType,
                        isComplete: false,
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
