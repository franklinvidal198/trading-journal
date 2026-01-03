import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Bell,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Trades",
    href: "/trades",
    icon: TrendingUp,
  },
  {
    name: "Statistics",
    href: "/stats",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState('real');
  const [modeLoading, setModeLoading] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Phase 6: Keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(open => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Phase 12: Dark mode toggle
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    fetch('/api/v1/system/mode')
      .then(res => res.json())
      .then(data => setMode(data.mode));
  }, []);

  const handleModeChange = async (newMode: string) => {
    setModeLoading(true);
    await fetch('/api/v1/system/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode })
    });
    setMode(newMode);
    setModeLoading(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 280 : 80,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-sidebar glass border-r border-sidebar-border relative z-10"
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
              <motion.div
                className="flex items-center space-x-3"
                animate={{ opacity: sidebarOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                {sidebarOpen && (
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    TradeJournal
                  </h1>
                )}
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-lg transition-smooth",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground glow-primary"
                            : "text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {sidebarOpen && (
                          <motion.span
                            className="ml-3 font-medium"
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Data Mode Toggle Section */}
            <div className="px-4 py-4 border-t border-sidebar-border">
              <div className="mb-2">
                <span className="text-xs text-muted-foreground">Data Mode:</span>
                <div className="mt-1 flex flex-col gap-1">
                  {['test', 'real', 'seed'].map(m => (
                    <Button
                      key={m}
                      variant={mode === m ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full text-left"
                      disabled={modeLoading}
                      onClick={() => handleModeChange(m)}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                      {mode === m && ' (Active)'}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-2"
                onClick={() => { logout(); navigate('/login'); }}
              >
                <LogOut className="h-4 w-4" />
                {sidebarOpen && <span className="ml-3">Sign Out</span>}
              </Button>
            </div>
          </div>

          {/* Toggle button */}
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="sm"
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar glass"
          >
            {sidebarOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
          </Button>
        </motion.aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-card/50 glass border-b border-border backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Trading Journal 2090
                </h2>
                {/* Phase 6: Breadcrumb navigation */}
                <Breadcrumb className="hidden md:flex">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    {location.pathname !== "/dashboard" && (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {navigationItems.find(item => item.href === location.pathname)?.name || "Page"}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center space-x-4">
                {/* Phase 6: Command palette trigger */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCommandOpen(true)}
                  className="hidden sm:inline-flex gap-2 text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                  <span>Search...</span>
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>

                {/* Phase 12: Dark mode toggle */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDarkModeToggle}
                  className="relative"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full glow-primary" />
                </Button>
                
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-gradient-primary hover:glow-primary transition-smooth"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade
                </Button>

                <div className="h-8 w-8 bg-gradient-secondary rounded-full glow-secondary" />
              </div>
            </div>
          </header>

          {/* Phase 6: Command Dialog for quick navigation */}
          <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput placeholder="Search pages, trades, stats..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                {navigationItems.map((item) => (
                  <CommandItem
                    key={item.name}
                    onSelect={() => {
                      navigate(item.href);
                      setCommandOpen(false);
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => {
                    logout();
                    navigate('/login');
                    setCommandOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>

          {/* Page content */}
          <main className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;