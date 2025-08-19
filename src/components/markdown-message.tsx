import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "~/lib/utils";

// Import custom syntax highlighting styles
import "~/styles/syntax-highlighting.css";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Custom components for better styling
          h1: ({ children, ...props }) => (
            <h1
              {...props}
              className="text-2xl font-bold mb-4 mt-6 text-foreground"
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              {...props}
              className="text-xl font-semibold mb-3 mt-5 text-foreground"
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              {...props}
              className="text-lg font-semibold mb-2 mt-4 text-foreground"
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4
              {...props}
              className="text-base font-semibold mb-2 mt-3 text-foreground"
            >
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="mb-3 leading-relaxed text-foreground">
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul
              {...props}
              className="mb-3 ml-6 list-disc space-y-1 text-foreground"
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              {...props}
              className="mb-3 ml-6 list-decimal space-y-1 text-foreground"
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="text-foreground">
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/50 italic text-foreground"
            >
              {children}
            </blockquote>
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4">
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <code
                    className={className}
                    {...props}
                    style={{
                      backgroundColor: "transparent",
                      padding: 0,
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code
                {...props}
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
              >
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className="bg-muted rounded-lg p-4 overflow-x-auto my-4"
            >
              {children}
            </pre>
          ),
          table: ({ children, ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table
                {...props}
                className="min-w-full border-collapse border border-border"
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props} className="bg-muted">
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody {...props}>{children}</tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr {...props} className="border-b border-border">
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th
              {...props}
              className="border border-border px-4 py-2 text-left font-semibold text-foreground"
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              {...props}
              className="border border-border px-4 py-2 text-foreground"
            >
              {children}
            </td>
          ),
          a: ({ children, href, ...props }) => (
            <a
              {...props}
              href={href}
              className="text-primary hover:underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em {...props} className="italic text-foreground">
              {children}
            </em>
          ),
          hr: ({ ...props }) => (
            <hr {...props} className="my-6 border-border" />
          ),
          img: ({ src, alt, ...props }) => (
            <img
              {...props}
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
