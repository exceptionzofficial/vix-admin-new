import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar, Store, ClipboardList, DollarSign,
  TrendingUp, MapPin, Car, Bell,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000 }, { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 }, { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 }, { month: "Jun", revenue: 72000 },
  { month: "Jul", revenue: 68000 }, { month: "Aug", revenue: 85000 },
];

const eventTypeData = [
  { name: "Corporate", value: 35 }, { name: "Wedding", value: 25 },
  { name: "Expo", value: 20 }, { name: "Concert", value: 20 },
];

const COLORS = ["#FFC107", "#FF7A00", "#FF0050", "#8B5CF6"];

const recentActivities = [
  { text: "New vendor 'SoundPro' registered", time: "2m ago", icon: Store },
  { text: "Event 'Tech Expo 2026' tickets live", time: "15m ago", icon: Calendar },
  { text: "Ravi completed poster distribution", time: "1h ago", icon: ClipboardList },
  { text: "Parking Zone B at 85% capacity", time: "2h ago", icon: Car },
  { text: "₹1.2L revenue from Chennai expo", time: "3h ago", icon: DollarSign },
];

const liveEmployees = [
  { name: "Ravi Kumar", status: "On Field", location: "Coimbatore", avatar: "RK" },
  { name: "Priya S", status: "At Event", location: "Chennai", avatar: "PS" },
  { name: "Arun M", status: "In Office", location: "Erode", avatar: "AM" },
  { name: "Divya R", status: "On Field", location: "Salem", avatar: "DR" },
];

const Dashboard = () => {
  const { userName, role } = useAuth();
  const navigate = useNavigate();

  const displayName = userName || "Admin";

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-montserrat font-bold">
            Welcome back, <span className="gradient-text">{displayName}</span>
          </h1>
          <p className="text-muted-foreground text-sm">Here's what's happening today</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass-card p-3 rounded-xl relative hover:bg-card/70 transition-all">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] flex items-center justify-center text-accent-foreground font-bold">3</span>
          </button>
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {displayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm font-medium">{displayName}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Active Employees" value={48} trend="12% this month" delay={0} />
        <StatCard icon={Calendar} label="Upcoming Events" value={12} trend="3 this week" delay={0.1} />
        <StatCard icon={Store} label="Active Vendors" value={156} trend="8 new" delay={0.2} />
        <StatCard icon={TrendingUp} label="Revenue (₹)" value={845000} suffix="" trend="18% growth" delay={0.3} accent />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-montserrat font-semibold mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFC107" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
              <XAxis dataKey="month" stroke="hsl(0 0% 60%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 60%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)", borderRadius: "12px", color: "hsl(0 0% 90%)" }} />
              <Area type="monotone" dataKey="revenue" stroke="#FFC107" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="font-montserrat font-semibold mb-4">Event Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={eventTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={5}>
                {eventTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)", borderRadius: "12px", color: "hsl(0 0% 90%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {eventTypeData.map((e, i) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {e.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Live Employees
            </h3>
            <button onClick={() => navigate("/live-map")} className="text-xs text-primary hover:underline">View Map →</button>
          </div>
          <div className="space-y-3">
            {liveEmployees.map((emp, i) => (
              <motion.div key={emp.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer"
                onClick={() => navigate("/live-map")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs pulse-dot">{emp.avatar}</div>
                  <div><p className="text-sm font-medium">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.location}</p></div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  emp.status === "On Field" ? "bg-secondary/20 text-secondary" :
                  emp.status === "At Event" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                }`}>{emp.status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-5">
          <h3 className="font-montserrat font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0"><act.icon className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm">{act.text}</p><p className="text-xs text-muted-foreground mt-0.5">{act.time}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
