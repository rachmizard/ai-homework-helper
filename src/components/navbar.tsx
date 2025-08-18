import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Badge } from "~/components/ui/badge";
import {
  Menu,
  X,
  BookOpen,
  Brain,
  Calculator,
  Microscope,
  PenTool,
  FileText,
  Trophy,
  User,
  Settings,
  LogOut,
  Sparkles,
  Home,
  BarChart3,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { SignInButton } from "@clerk/tanstack-react-start";

const subjects = [
  {
    title: "Mathematics",
    href: "/subjects/math",
    description: "Algebra, Calculus, Geometry, and more",
    icon: Calculator,
  },
  {
    title: "Science",
    href: "/subjects/science",
    description: "Physics, Chemistry, Biology, and Earth Science",
    icon: Microscope,
  },
  {
    title: "Writing",
    href: "/subjects/writing",
    description: "Essays, Creative Writing, and Grammar",
    icon: PenTool,
  },
  {
    title: "Summary",
    href: "/subjects/summary",
    description: "Text Analysis and Summarization",
    icon: FileText,
  },
];

const features = [
  {
    title: "AI Hints",
    href: "/features/hints",
    description: "Get smart hints without direct answers",
  },
  {
    title: "Concept Learning",
    href: "/features/concepts",
    description: "Understand the underlying concepts",
  },
  {
    title: "Practice Problems",
    href: "/features/practice",
    description: "Reinforce learning with similar problems",
  },
  {
    title: "Quiz Mode",
    href: "/features/quiz",
    description: "Test your knowledge with interactive quizzes",
  },
];

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-background rounded-lg p-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI Homework
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Helper
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Subjects
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {subjects.map((subject) => (
                        <ListItem
                          key={subject.title}
                          title={subject.title}
                          href={subject.href}
                          icon={subject.icon}
                        >
                          {subject.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {features.map((feature) => (
                        <ListItem
                          key={feature.title}
                          title={feature.title}
                          href={feature.href}
                        >
                          {feature.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/dashboard">
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                      <Badge variant="secondary" className="ml-2 text-xs">
                        New
                      </Badge>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      AI Homework Helper
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-3">
                    <Link
                      to="/"
                      className="flex items-center space-x-3 text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span>Dashboard</span>
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    </Link>
                  </div>

                  {/* Mobile Subjects */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Subjects
                    </h3>
                    {subjects.map((subject) => (
                      <Link
                        key={subject.title}
                        to={subject.href}
                        className="flex items-center space-x-3 text-sm hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <subject.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{subject.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {subject.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Features */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Features
                    </h3>
                    {features.map((feature) => (
                      <Link
                        key={feature.title}
                        to={feature.href}
                        className="flex items-center space-x-3 text-sm hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Sparkles className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{feature.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {feature.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile User Actions */}
                  <div className="space-y-3 pt-6 border-t">
                    <SignInButton>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </SignInButton>
                    <Button className="w-full justify-start">
                      <Trophy className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    icon?: React.ElementType;
  }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
