import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Trophy, Star, Target, Flame, Medal, TrendingUp } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Priya Sharma", avatar: "PS", score: 980, badge: "🥇", events: 12, streak: 15 },
  { rank: 2, name: "Ravi Kumar", avatar: "RK", score: 920, badge: "🥈", events: 10, streak: 12 },
  { rank: 3, name: "Sneha B", avatar: "SB", score: 875, badge: "🥉", events: 9, streak: 10 },
  { rank: 4, name: "Arun Mohan", avatar: "AM", score: 820, badge: "", events: 8, streak: 8 },
  { rank: 5, name: "Divya Raj", avatar: "DR", score: 790, badge: "", events: 7, streak: 6 },
  { rank: 6, name: "Lakshmi N", avatar: "LN", score: 750, badge: "", events: 7, streak: 5 },
  { rank: 7, name: "Vijay R", avatar: "VR", score: 710, badge: "", events: 6, streak: 4 },
  { rank: 8, name: "Karthik V", avatar: "KV", score: 680, badge: "", events: 5, streak: 3 },
  { rank: 9, name: "Deepa S", avatar: "DS", score: 640, badge: "", events: 5, streak: 2 },
  { rank: 10, name: "Manoj K", avatar: "MK", score: 600, badge: "", events: 4, streak: 1 },
];

const challenges = [
  { title: "Complete 5 Events This Month", reward: "₹5,000 Bonus", progress: 80, icon: Target, color: "#FFC107" },
  { title: "Maintain 95%+ Attendance", reward: "Extra Leave Day", progress: 92, icon: Flame, color: "#FF7A00" },
  { title: "Get 5-Star Client Rating", reward: "₹3,000 Bonus", progress: 60, icon: Star, color: "#FF0050" },
  { title: "Onboard 3 New Vendors", reward: "₹2,000 Bonus", progress: 33, icon: Medal, color: "#8B5CF6" },
];

const Incentives = () => (
  <DashboardLayout>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Incentive Tracker</h1>
          <p className="text-muted-foreground text-sm">Performance rewards & leaderboard</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">March 2026</span>
        </div>
      </div>

      {/* Active Challenges */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {challenges.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card-hover p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: c.color + "20" }}>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Reward: <span className="text-primary font-medium">{c.reward}</span></p>
              </div>
              <span className="text-sm font-bold" style={{ color: c.color }}>{c.progress}%</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                className="h-full rounded-full" style={{ backgroundColor: c.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" /> Leaderboard
      </h2>
      <div className="space-y-2">
        {leaderboard.map((emp, i) => (
          <motion.div key={emp.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
            className={`glass-card-hover p-4 flex items-center gap-4 ${emp.rank <= 3 ? "border-primary/20" : ""}`}>
            <span className="text-lg font-bold font-montserrat w-8 text-center" style={{
              color: emp.rank === 1 ? "#FFC107" : emp.rank === 2 ? "#C0C0C0" : emp.rank === 3 ? "#CD7F32" : "hsl(0, 0%, 50%)"
            }}>
              {emp.badge || `#${emp.rank}`}
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {emp.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{emp.name}</h3>
              <p className="text-xs text-muted-foreground">{emp.events} events · {emp.streak} day streak 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-montserrat gradient-text">{emp.score}</p>
              <p className="text-[10px] text-muted-foreground">points</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </DashboardLayout>
);

export default Incentives;
