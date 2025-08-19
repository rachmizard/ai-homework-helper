import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Camera,
  CheckCircle2,
  RefreshCw,
  Send,
  Sparkles,
  Type,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import Aurora from "~/components/backgrounds/Aurora/Aurora";
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
import type { ChatMessage } from "~/components/chat-interface";
import { InputMethodEnum } from "~/db";

const ChatInterface = React.lazy(() => import("~/components/chat-interface"));

export const Route = createFileRoute("/_guestLayout/")({
  component: HomeworkHelper,
});

type Subject = "math" | "science" | "writing" | "summary" | null;
type Mode = "hint" | "concept" | "practice" | "quiz";

function HomeworkHelper() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [textInput, setTextInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [detectedSubject, setDetectedSubject] = React.useState<Subject>(null);
  const [inputMethod, setInputMethod] = React.useState<InputMethodEnum | null>(
    null
  );

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setInputMethod("photo");
    setTextInput("");
    // Simulate OCR processing
    setTimeout(() => {
      const mockExtractedText = "Solve: 2x + 3 = 7";
      addMessage("user", `📸 Photo uploaded: "${mockExtractedText}"`);
      detectSubject(mockExtractedText);
    }, 1000);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setInputMethod(null);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;

    setInputMethod("text");
    setSelectedFile(null);
    addMessage("user", textInput);
    detectSubject(textInput);
    setTextInput("");
  };

  const detectSubject = (text: string) => {
    // Simple subject detection logic
    if (/\d+x|solve|equation|calculate/i.test(text)) {
      setDetectedSubject("math");
    } else if (/essay|write|paragraph/i.test(text)) {
      setDetectedSubject("writing");
    } else if (/summarize|summary|main idea/i.test(text)) {
      setDetectedSubject("summary");
    } else if (/science|physics|chemistry|biology/i.test(text)) {
      setDetectedSubject("science");
    } else {
      setDetectedSubject("math"); // Default
    }
  };

  const addMessage = (type: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleModeSelect = async (mode: Mode) => {
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      let response = "";

      switch (mode) {
        case "hint":
          response = getHintResponse(detectedSubject);
          break;
        case "concept":
          response = getConceptResponse(detectedSubject);
          break;
        case "practice":
          response = getPracticeResponse(detectedSubject);
          break;
        case "quiz":
          response = getQuizResponse(detectedSubject);
          break;
      }

      addMessage("assistant", response);
      setIsProcessing(false);
      toast.success(
        `${mode.charAt(0).toUpperCase() + mode.slice(1)} generated! 🎉`
      );
    }, 1500);
  };

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
    return hints[subject || "math"];
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
    return concepts[subject || "math"];
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
    return practice[subject || "math"];
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
    return quiz[subject || "math"];
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
          </div>
        </div>
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
              {detectedSubject && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Detected subject:</span>
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
                    disabled={isProcessing}
                    className="hover:border-yellow-500"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Hint 💡
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("concept")}
                    disabled={isProcessing}
                    className="hover:border-blue-500"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Learn Concept 🧠
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("practice")}
                    disabled={isProcessing}
                    className="hover:border-green-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Practice 🔄
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeSelect("quiz")}
                    disabled={isProcessing}
                    className="hover:border-rose-500"
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
                I'm here to guide you, not give you answers!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ChatInterface
                messages={messages}
                className="h-full overflow-y-auto"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
