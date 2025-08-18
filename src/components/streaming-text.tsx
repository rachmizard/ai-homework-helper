import React from "react";
import { cn } from "~/lib/utils";

interface StreamingTextProps {
  content: string;
  isComplete?: boolean;
  className?: string;
  showCursor?: boolean;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  isComplete = false,
  className,
  showCursor = true,
}) => {
  return (
    <div className={cn("relative", className)}>
      <span className="whitespace-pre-wrap break-words">
        {content}
      </span>
      {!isComplete && showCursor && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
      )}
    </div>
  );
};

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  onComplete,
  className,
}) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  React.useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className={cn("relative", className)}>
      <span className="whitespace-pre-wrap break-words">
        {displayedText}
      </span>
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
      )}
    </div>
  );
};

interface AnimatedMessageProps {
  children: React.ReactNode;
  type: "user" | "assistant";
  isStreaming?: boolean;
  className?: string;
}

export const AnimatedMessage: React.FC<AnimatedMessageProps> = ({
  children,
  type,
  isStreaming = false,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "transform transition-all duration-500 ease-out",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-4 opacity-0",
        type === "assistant" && isStreaming && "animate-pulse",
        className
      )}
    >
      {children}
      {isStreaming && (
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
    </div>
  );
};
