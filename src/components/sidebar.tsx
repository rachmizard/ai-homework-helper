import { SignedIn, UserButton } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  FileText,
  Home,
  Microscope,
  Monitor,
  Moon,
  PenTool,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "~/components/theme-provider";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
  SidebarSeparator,
} from "~/components/ui/sidebar";

const subjects = [
  {
    title: "Mathematics",
    href: "/dashboard/subjects/math",
    description: "Algebra, Calculus, Geometry",
    icon: Calculator,
  },
  {
    title: "Science",
    href: "/dashboard/subjects/science",
    description: "Physics, Chemistry, Biology",
    icon: Microscope,
  },
  {
    title: "Writing",
    href: "/dashboard/subjects/writing",
    description: "Essays, Creative Writing",
    icon: PenTool,
  },
  {
    title: "Summary",
    href: "/dashboard/subjects/summary",
    description: "Text Analysis & Summarization",
    icon: FileText,
  },
];

const features = [
  {
    title: "AI Hints",
    href: "/dashboard/features/hints",
    description: "Smart hints without answers",
    icon: Sparkles,
  },
  {
    title: "Concept Learning",
    href: "/dashboard/features/concepts",
    description: "Understand core concepts",
    icon: Brain,
  },
  {
    title: "Practice Problems",
    href: "/dashboard/features/practice",
    description: "Reinforce with similar problems",
    icon: BookOpen,
  },
];

function SettingsDropdown() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader>
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 group p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-background rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI Homework
            </span>
            <span className="text-xs text-muted-foreground -mt-1">Helper</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      New
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Subjects */}
        <SidebarGroup>
          <SidebarGroupLabel>Subjects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {subjects.map((subject) => (
                <SidebarMenuItem key={subject.title}>
                  <SidebarMenuButton asChild tooltip={subject.description}>
                    <Link to={subject.href}>
                      <subject.icon className="h-4 w-4" />
                      <span>{subject.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {features.map((feature) => (
                <SidebarMenuItem key={feature.title}>
                  <SidebarMenuButton asChild tooltip={feature.description}>
                    <Link to={feature.href}>
                      <feature.icon className="h-4 w-4" />
                      <span>{feature.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-2">
        <div className="flex items-center justify-between gap-2">
          {/* Compact User Section */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-lg border",
                  userButtonPopoverActions: "space-y-1",
                },
              }}
            />
          </SignedIn>

          {/* Settings Dropdown */}
          <SettingsDropdown />
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
