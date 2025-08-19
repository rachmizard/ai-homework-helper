import React from "react";
import { MarkdownMessage } from "./markdown-message";
import { StreamingMarkdown } from "./streaming-markdown";
import { Card } from "./ui/card";

const sampleMarkdown = `# Welcome to AI Homework Helper! 🎓

This is a **bold text** and this is *italic text*. Here's how markdown works in our chat interface:

## Code Examples

Here's a simple JavaScript function:

\`\`\`javascript
function solveEquation(x) {
  return 2 * x + 3;
}

console.log(solveEquation(5)); // Output: 13
\`\`\`

And here's some Python code:

\`\`\`python
def calculate_area(length, width):
    return length * width

result = calculate_area(10, 5)
print(f"The area is: {result}")  # Output: The area is: 50
\`\`\`

## Lists and Organization

### Unordered List:
- Math problems
- Science experiments  
- Writing assignments
- History research

### Ordered List:
1. Upload your homework photo
2. AI detects the subject
3. Get personalized help
4. Learn and improve!

## Tables

| Subject | Difficulty | Time Required |
|---------|------------|---------------|
| Math    | Medium     | 15-30 min     |
| Science | Hard       | 30-45 min     |
| Writing | Easy       | 10-20 min     |

## Blockquotes

> "The best way to learn is by doing. Our AI helps you understand the process, not just get the answer."

## Links and References

Check out our [study tips](https://example.com) and [practice problems](https://example.com).

## Mathematical Expressions

For math problems, you can use inline code like \`x = 5\` or \`y = 2x + 3\`.

---

*Ready to start learning? Just upload your homework or type your question!*`;

export function MarkdownDemo() {
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingContent, setStreamingContent] = React.useState("");

  React.useEffect(() => {
    // Simulate streaming effect
    setIsStreaming(true);
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < sampleMarkdown.length) {
        setStreamingContent(sampleMarkdown.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Markdown Integration Demo</h2>
        <p className="text-muted-foreground mb-6">
          Your chat interface now supports full markdown rendering like ChatGPT!
        </p>
      </div>

      {/* Static Markdown Example */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">
          Static Markdown Rendering
        </h3>
        <MarkdownMessage content={sampleMarkdown} />
      </Card>

      {/* Streaming Markdown Example */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">
          Streaming Markdown Rendering
        </h3>
        <div className="bg-muted p-4 rounded-lg">
          <StreamingMarkdown
            content={streamingContent}
            isComplete={!isStreaming}
            className="text-sm"
          />
        </div>
      </Card>

      {/* Features List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">
          Supported Markdown Features
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            ✅ <strong>Headers</strong> (H1-H6)
          </li>
          <li>
            ✅ <strong>Bold and Italic</strong> text
          </li>
          <li>
            ✅ <strong>Code blocks</strong> with syntax highlighting
          </li>
          <li>
            ✅ <strong>Inline code</strong>
          </li>
          <li>
            ✅ <strong>Lists</strong> (ordered and unordered)
          </li>
          <li>
            ✅ <strong>Tables</strong>
          </li>
          <li>
            ✅ <strong>Blockquotes</strong>
          </li>
          <li>
            ✅ <strong>Links</strong>
          </li>
          <li>
            ✅ <strong>Images</strong>
          </li>
          <li>
            ✅ <strong>Horizontal rules</strong>
          </li>
          <li>
            ✅ <strong>GitHub Flavored Markdown</strong> (GFM)
          </li>
          <li>
            ✅ <strong>Real-time streaming</strong> with markdown parsing
          </li>
        </ul>
      </Card>
    </div>
  );
}
