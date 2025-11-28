import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Screens from "./pages/Screens";
import ScreenDetails from "./pages/ScreenDetails";
import Media from "./pages/Media";
import Playlists from "./pages/Playlists";
import PlaylistEditor from "./pages/PlaylistEditor";
import PlaylistPreview from "./pages/PlaylistPreview";
import Schedules from "./pages/Schedules";
import ScheduleEditor from "./pages/ScheduleEditor";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/screens"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Screens />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/screens/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ScreenDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Media />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Playlists />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlaylistEditor />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/playlists/:id/preview" element={<PlaylistPreview />} />
            <Route
              path="/schedules"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Schedules />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedules/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ScheduleEditor />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedules/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ScheduleEditor />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
