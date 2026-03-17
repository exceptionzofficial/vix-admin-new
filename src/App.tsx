import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Events from "./pages/Events";
import Geofence from "./pages/Geofence";
import Vendors from "./pages/Vendors";
import Tasks from "./pages/Tasks";
import Telecalling from "./pages/Telecalling";
import LiveMap from "./pages/LiveMap";
import Parking from "./pages/Parking";
import Expenses from "./pages/Expenses";
import Chat from "./pages/Chat";
import Finance from "./pages/Finance";
import SettingsPage from "./pages/Settings";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Incentives from "./pages/Incentives";
import UpcomingProjects from "./pages/UpcomingProjects";
import EmployeePortal from "./pages/EmployeePortal";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/attendance" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/geofence" element={<Geofence />} />
            
            {/* All other routes redirected to Coming Soon */}
            <Route path="/payroll" element={<ComingSoon />} />
            <Route path="/events" element={<ComingSoon />} />
            <Route path="/vendors" element={<ComingSoon />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<ComingSoon />} />
            <Route path="/live-map" element={<ComingSoon />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/finance" element={<ComingSoon />} />
            <Route path="/incentives" element={<ComingSoon />} />
            <Route path="/settings" element={<ComingSoon />} />
            <Route path="/employee-portal" element={<EmployeePortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
