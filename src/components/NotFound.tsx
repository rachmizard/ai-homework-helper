import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NotFound({ children }: { children?: any }) {
  return (
    <div className="space-y-2 p-2 flex flex-col items-center justify-center h-screen">
      <div className="text-gray-600 dark:text-gray-400">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => window.history.back()} variant="outline">
          Go back
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Start Over</Link>
        </Button>
      </div>
    </div>
  );
}
