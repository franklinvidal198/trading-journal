import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Journal from "./pages/Journal";
import Templates from "./pages/Templates";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Protected routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="trades" element={<Trades />} />
                <Route path="stats" element={<Stats />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="journal" element={<Journal />} />
                <Route path="templates" element={<Templates />} />
                <Route path="goals" element={<Goals />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
