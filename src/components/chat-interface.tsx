import * as React from "react";
import { cn } from "~/lib/utils";
import { Bot, User } from "lucide-react";
import { Card } from "~/components/ui/card";
import { StreamingText, AnimatedMessage } from "~/components/streaming-text";

export type MessageType = "user" | "assistant";

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  mode?: "hint" | "concept" | "practice" | "quiz";
  isStreaming?: boolean;
  isComplete?: boolean;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  className?: string;
  streamingMessage?: {
    content: string;
    type: "hint" | "concept" | "practice" | "quiz";
    isComplete: boolean;
  };
}

export function ChatInterface({
  messages,
  className,
  streamingMessage,
}: ChatInterfaceProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className
        )}
      >
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Upload a photo or type your homework question to get started! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

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
    </div>
  );
}

interface ChatMessageProps {
  message: ChatMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
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
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
