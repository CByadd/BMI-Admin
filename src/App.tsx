import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/screens" element={<Layout><Screens /></Layout>} />
            <Route path="/screens/:id" element={<Layout><ScreenDetails /></Layout>} />
            <Route path="/media" element={<Layout><Media /></Layout>} />
            <Route path="/playlists" element={<Layout><Playlists /></Layout>} />
            <Route path="/playlists/:id/edit" element={<Layout><PlaylistEditor /></Layout>} />
            <Route path="/playlists/:id/preview" element={<PlaylistPreview />} />
            <Route path="/schedules" element={<Layout><Schedules /></Layout>} />
            <Route path="/schedules/:id/edit" element={<Layout><ScheduleEditor /></Layout>} />
            <Route path="/schedules/new" element={<Layout><ScheduleEditor /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
