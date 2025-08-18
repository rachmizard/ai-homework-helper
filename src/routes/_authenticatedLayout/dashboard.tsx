import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Brain, Trophy, Zap, BookOpen, Plus } from "lucide-react";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useUserProgressSummary } from "~/hooks/use-chat-history";
import type { UserProgressSummary } from "~/db/schema";

export const Route = createFileRoute("/_authenticatedLayout/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useUser();
  const { data: progressSummary, isLoading } = useUserProgressSummary();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Welcome back, {user?.firstName || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your learning journey? Let's make some progress
            today!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link to="/homework-helper">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Start New Homework
            </Button>
          </Link>
          <Link to="/homework-helper">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : progressSummary?.totalTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Homework problems solved
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hints Used</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : progressSummary?.totalHints || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Smart guidance received
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concepts Learned
            </CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : progressSummary?.totalConcepts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Knowledge gained</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : progressSummary?.totalQuizzes || 0}
            </div>
            <p className="text-xs text-muted-foreground">Knowledge tested</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning sessions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed Math Quiz</p>
                  <p className="text-xs text-muted-foreground">
                    Algebra - Linear Equations
                  </p>
                </div>
                <Badge variant="secondary">+5 XP</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Learned New Concept</p>
                  <p className="text-xs text-muted-foreground">
                    Science - Photosynthesis
                  </p>
                </div>
                <Badge variant="secondary">+3 XP</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Practice Session</p>
                  <p className="text-xs text-muted-foreground">
                    Writing - Essay Structure
                  </p>
                </div>
                <Badge variant="secondary">+2 XP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and learning preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-sm">{user?.fullName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since
                </p>
                <p className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Learning Level
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Intermediate</Badge>
                  <span className="text-xs text-muted-foreground">Level 3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
