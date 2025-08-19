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
import { Input } from "~/components/ui/input";
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

  // Session name state
  const [sessionName, setSessionName] = React.useState("");
  const [isSessionNameSet, setIsSessionNameSet] = React.useState(false);

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

  const handleSessionNameSubmit = () => {
    if (!sessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }
    setIsSessionNameSet(true);
    setSessionTitle(sessionName);
    toast.success("Session name set! You can now start your homework session.");
  };

  const handleFileSelect = async (file: File) => {
    if (!isSessionNameSet) {
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
    if (!isSessionNameSet) {
      toast.error("Please set a session name first");
      return;
    }

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

    if (!user || !user.data) return;

    try {
      const session = await createSessionMutation.mutateAsync({
        userId: user.data.id,
        title: sessionTitle, // Use the session name that was set
        subject: detectedSubject,
        inputMethod,
        originalInput,
        extractedText: inputMethod === "photo" ? originalInput : null,
      });

      setCurrentSessionId(session.id);

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
    setIsSessionNameSet(true); // Mark as set when loading existing session
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
    setSessionName("");
    setIsSessionNameSet(false);
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
                {!isSessionNameSet
                  ? "First, give your session a name, then take a photo or type your question"
                  : "Take a photo or type your question to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session Name Input */}
              {!isSessionNameSet && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Session Name</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter session name (e.g., Math Homework - Chapter 5)"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSessionNameSubmit();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSessionNameSubmit}
                      disabled={!sessionName.trim()}
                      size="sm"
                    >
                      Set Name
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Give your homework session a descriptive name to help you
                    find it later
                  </p>
                </div>
              )}

              {/* Input Method Toggle - Only show after session name is set */}
              {isSessionNameSet && (
                <>
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
                      <span className="text-sm">
                        AI is detecting subject...
                      </span>
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Your Learning Journey 🎯</CardTitle>
              <CardDescription>
                {!isSessionNameSet
                  ? "Set a session name to start your learning journey!"
                  : "I'm here to guide you, not give you answers! Your progress is saved automatically."}
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
