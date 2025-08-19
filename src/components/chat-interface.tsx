import { useUser } from "@clerk/tanstack-react-start";
import {
  Bot,
  Send,
  User,
  Camera,
  Type,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import * as React from "react";
import { StreamingText } from "~/components/streaming-text";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { FileUpload } from "~/components/file-upload";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

export type MessageType = "user" | "assistant";

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  mode?: "hint" | "concept" | "practice" | "quiz" | "chat";
  isStreaming?: boolean;
  isComplete?: boolean;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  className?: string;
  streamingMessage?: {
    content: string;
    type: "hint" | "concept" | "practice" | "quiz" | "chat";
    isComplete: boolean;
  };
  onSendMessage?: (message: string) => void;
  isStreaming?: boolean;
  showInput?: boolean;
  // Enhanced props for integrated input functionality
  sessionTitle?: string;
  onSessionTitleChange?: (value: string) => void;
  onSessionTitleSubmit?: () => void;
  inputMethod?: "photo" | "text" | null;
  onInputMethodChange?: (method: "photo" | "text" | null) => void;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  textInput?: string;
  onTextInputChange?: (value: string) => void;
  onTextSubmit?: () => void;
  isDetecting?: boolean;
  detectedSubject?: string;
  isSessionTitleSubmitted?: boolean;
}

export function ChatInterface({
  messages,
  className,
  streamingMessage,
  onSendMessage,
  isStreaming = false,
  showInput = true,
  // Enhanced props
  sessionTitle,
  onSessionTitleChange,
  onSessionTitleSubmit,
  inputMethod,
  onInputMethodChange,
  selectedFile,
  onFileSelect,
  onFileRemove,
  textInput,
  onTextInputChange,
  onTextSubmit,
  isDetecting,
  detectedSubject,
  isSessionTitleSubmitted = false,
}: ChatInterfaceProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !onSendMessage || isStreaming) return;

    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show initial setup if no session title or session title not submitted
  if (!sessionTitle || !isSessionTitleSubmitted) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center h-full",
          className
        )}
      >
        <div className="max-w-md w-full space-y-6">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Start Your Learning Journey! 🚀
            </h3>
            <p className="text-muted-foreground text-sm">
              Give your homework session a descriptive name to get started
            </p>

            {/* Session Name Input */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Session Name</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter session name (e.g., Math Homework - Chapter 5)"
                  value={sessionTitle || ""}
                  onChange={(e) => onSessionTitleChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSessionTitleSubmit?.();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={onSessionTitleSubmit}
                  disabled={!sessionTitle?.trim()}
                  size="sm"
                >
                  Set Name
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Give your homework session a descriptive name to help you find
                it later
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show input method selection if session title is set but no input method chosen
  if (sessionTitle && !inputMethod && messages.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center h-full",
          className
        )}
      >
        <div className="max-w-md w-full space-y-6">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              How would you like to start? 📚
            </h3>
            <p className="text-muted-foreground text-sm">
              Choose how you'd like to input your homework question
            </p>

            {/* Input Method Toggle */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onInputMethodChange?.("photo")}
                className="flex-1 transition-all duration-300 h-16"
              >
                <Camera className="h-5 w-5 mr-2" />
                Photo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onInputMethodChange?.("text")}
                className="flex-1 transition-all duration-300 h-16"
              >
                <Type className="h-5 w-5 mr-2" />
                Text
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show file upload or text input based on selected method
  if (sessionTitle && inputMethod && messages.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center h-full",
          className
        )}
      >
        <div className="max-w-md w-full space-y-6">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {inputMethod === "photo"
                ? "Upload Your Homework Photo 📸"
                : "Type Your Question 🤔"}
            </h3>

            {/* File Upload */}
            {inputMethod === "photo" && onFileSelect && onFileRemove && (
              <div className="space-y-4">
                <FileUpload
                  onFileSelect={onFileSelect}
                  onFileRemove={onFileRemove}
                  selectedFile={selectedFile || null}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInputMethodChange?.(null)}
                  className="w-full"
                >
                  ← Back to Input Method
                </Button>
              </div>
            )}

            {/* Text Input */}
            {inputMethod === "text" && onTextInputChange && onTextSubmit && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type or paste your homework question here... 🤔"
                    value={textInput || ""}
                    onChange={(e) => onTextInputChange?.(e.target.value)}
                    className="min-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onTextSubmit?.();
                      }
                    }}
                  />
                  <Button
                    onClick={onTextSubmit}
                    disabled={!(textInput || "").trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Question
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInputMethodChange?.(null)}
                  className="w-full"
                >
                  ← Back to Input Method
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Container */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Streaming message */}
        {streamingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <Card className="max-w-[80%] px-4 py-3 bg-muted">
              <StreamingText
                content={streamingMessage.content}
                isComplete={streamingMessage.isComplete}
                className="text-sm"
              />
              {!streamingMessage.isComplete && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    AI is thinking...
                  </span>
                </div>
              )}
              {streamingMessage.isComplete && (
                <p className="text-xs mt-1 text-muted-foreground">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Section */}
      {showInput && onSendMessage && (
        <div className="border-t bg-background p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Continue the conversation... Ask follow-up questions or request more help! 💬"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isStreaming}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isStreaming && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
              AI is responding...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ChatMessageProps {
  message: ChatMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useUser();
  const isUser = message.type === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <Card
        className={cn(
          "max-w-[80%] px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </Card>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
