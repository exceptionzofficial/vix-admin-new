import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Calendar, Store, Phone,
  MapPin, ClipboardList, DollarSign, MessageSquare,
  Settings, ChevronLeft, ChevronRight, Car, LogOut, FileText,
  Clock, IndianRupee, Trophy, Rocket, Map
} from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import crayonzLogo from "@/assets/crayonz-logo.png";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["admin", "manager", "employee", "vendor"], isLive: false },
  { icon: Clock, label: "Attendance", path: "/attendance", roles: ["admin", "manager", "employee"], isLive: true },
  { icon: FileText, label: "Leaves", path: "/leaves", roles: ["admin", "manager", "employee"], isLive: true },
  { icon: IndianRupee, label: "Payroll", path: "/payroll", roles: ["admin", "manager", "employee"], isLive: false },
  { icon: Users, label: "Employees", path: "/employees", roles: ["admin", "manager"], isLive: true },
  { icon: Map, label: "Geofence", path: "/geofence", roles: ["admin", "manager"], isLive: true },
  { icon: Calendar, label: "Events", path: "/events", roles: ["admin", "manager", "employee"], isLive: false },
  { icon: ClipboardList, label: "Tasks", path: "/tasks", roles: ["admin", "manager", "employee"], isLive: true },
  { icon: Rocket, label: "Projects", path: "/projects", roles: ["admin", "manager"], isLive: false },
  { icon: Store, label: "Vendors", path: "/vendors", roles: ["admin", "manager", "vendor"], isLive: false },
  { icon: DollarSign, label: "Expenses", path: "/expenses", roles: ["admin", "manager", "employee"], isLive: true },
  { icon: FileText, label: "Finance", path: "/finance", roles: ["admin", "manager"], isLive: false },
  { icon: Trophy, label: "Incentives", path: "/incentives", roles: ["admin", "manager", "employee"], isLive: false },
  { icon: MapPin, label: "Live Map", path: "/live-map", roles: ["admin", "manager"], isLive: false },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["admin"], isLive: false },
];

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      className="h-screen glass-card border-r border-border/50 flex flex-col fixed left-0 top-0 z-50"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 border-b border-border/30">
        <img src={crayonzLogo} alt="Crayonz" className="w-8 h-8 object-contain shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-montserrat font-bold text-lg gradient-text whitespace-nowrap overflow-hidden"
            >
              CRAYONZ
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={onNavigate}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      className="flex-1 flex items-center justify-between min-w-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                      {!item.isLive && (
                        <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                          Soon
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse & Logout */}
      <div className="p-3 border-t border-border/30 space-y-1">
        <button onClick={handleLogout} className="w-full">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </div>
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-xl text-muted-foreground hover:bg-muted/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
