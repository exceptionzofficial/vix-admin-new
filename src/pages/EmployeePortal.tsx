import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, Clock, CheckCircle2, ClipboardList, IndianRupee, Receipt, Trophy, Calendar, Bell, LogOut, User, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Tab = "home" | "attendance" | "tasks" | "expenses" | "profile";

const myTasks = [
  { id: 1, title: "Distribute posters - Coimbatore", deadline: "Mar 8", priority: "High", status: "In Progress" },
  { id: 2, title: "Client follow-up - Rajesh Ind.", deadline: "Mar 9", priority: "Medium", status: "Assigned" },
  { id: 3, title: "Collect banners from PrintMax", deadline: "Mar 10", priority: "Low", status: "Assigned" },
  { id: 4, title: "Venue inspection - Convention Center", deadline: "Mar 12", priority: "High", status: "Completed" },
];

const myExpenses = [
  { id: 1, title: "Travel - Client visit", amount: "₹2,400", date: "Mar 5", status: "Approved" },
  { id: 2, title: "Fuel for field work", amount: "₹1,200", date: "Mar 6", status: "Pending" },
  { id: 3, title: "Lunch - Team meeting", amount: "₹850", date: "Mar 7", status: "Pending" },
];

const weekAttendance = [
  { day: "Mon", checkIn: "9:02 AM", checkOut: "6:15 PM", status: "Present" },
  { day: "Tue", checkIn: "9:00 AM", checkOut: "6:00 PM", status: "Present" },
  { day: "Wed", checkIn: "9:30 AM", checkOut: "6:30 PM", status: "Late" },
  { day: "Thu", checkIn: "8:55 AM", checkOut: "6:10 PM", status: "Present" },
  { day: "Fri", checkIn: "—", checkOut: "—", status: "Today" },
];

const EmployeePortal = () => {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("home");
  const [checkedIn, setCheckedIn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const displayName = userName || "Employee";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2);

  const startCamera = useCallback(async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setCameraReady(true); }
    } catch {
      toast.error("Camera denied, using location.");
      setShowCamera(false);
      doLocationCheckIn();
    }
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
    setCameraReady(false);
  };

  const doFaceCheckIn = () => {
    toast.loading("Scanning...", { id: "scan" });
    setTimeout(() => { toast.success("Face verified! ✅", { id: "scan" }); setCheckedIn(true); stopCamera(); }, 2000);
  };

  const doLocationCheckIn = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { toast.success(`Checked in at ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`); setCheckedIn(true); },
      () => toast.error("Location denied")
    );
  };

  const handleLogout = () => { logout(); navigate("/"); };

  useEffect(() => { return () => { streamRef.current?.getTracks().forEach(t => t.stop()); }; }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const tabs: { id: Tab; icon: typeof User; label: string }[] = [
    { id: "home", icon: User, label: "Home" },
    { id: "attendance", icon: Clock, label: "Attend" },
    { id: "tasks", icon: ClipboardList, label: "Tasks" },
    { id: "expenses", icon: Receipt, label: "Expense" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 glass-card px-4 py-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{initials}</div>
          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">Employee Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl glass-card relative"><Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full text-[8px] flex items-center justify-center text-accent-foreground font-bold">2</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Quick Check-in */}
              {!checkedIn ? (
                <div className="glass-card p-5 mb-4 text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-montserrat font-bold gradient-text mb-1">{timeStr}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {now.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={startCamera} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4" /> Face Check-in
                    </button>
                    <button onClick={doLocationCheckIn}
                      className="px-5 py-2.5 rounded-xl border border-primary/30 text-primary text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> GPS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-4 mb-4 flex items-center gap-3 bg-green-500/5 border-green-500/20">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <div><p className="text-sm font-medium text-green-400">Checked in</p><p className="text-xs text-muted-foreground">{timeStr}</p></div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Tasks", value: "3", color: "text-primary" },
                  { label: "Expenses", value: "₹4.4K", color: "text-secondary" },
                  { label: "Score", value: "920", color: "text-accent" },
                ].map(s => (
                  <div key={s.label} className="glass-card p-3 text-center">
                    <p className={`text-lg font-bold font-montserrat ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Today's Tasks */}
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Today's Tasks</h3>
              <div className="space-y-2 mb-4">
                {myTasks.filter(t => t.status !== "Completed").slice(0, 3).map(t => (
                  <div key={t.id} className="glass-card p-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.priority === "High" ? "bg-accent" : t.priority === "Medium" ? "bg-primary" : "bg-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">Due: {t.deadline}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "attendance" && (
            <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-montserrat font-bold mb-4">This Week</h2>
              <div className="space-y-2">
                {weekAttendance.map(d => (
                  <div key={d.day} className="glass-card p-3 flex items-center justify-between">
                    <span className="text-sm font-medium w-10">{d.day}</span>
                    <span className="text-xs text-muted-foreground">{d.checkIn} — {d.checkOut}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      d.status === "Present" ? "bg-green-500/20 text-green-400" :
                      d.status === "Late" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-montserrat font-bold mb-4">My Tasks</h2>
              <div className="space-y-2">
                {myTasks.map(t => (
                  <div key={t.id} className="glass-card-hover p-4 flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${t.status === "Completed" ? "bg-green-500/10" : "bg-primary/10"}`}>
                      {t.status === "Completed" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <ClipboardList className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${t.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">Due: {t.deadline} · {t.priority}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${
                      t.status === "Completed" ? "bg-green-500/20 text-green-400" :
                      t.status === "In Progress" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                    }`}>{t.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "expenses" && (
            <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-montserrat font-bold mb-4">My Expenses</h2>
              <div className="space-y-2">
                {myExpenses.map(e => (
                  <div key={e.id} className="glass-card p-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10"><Receipt className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground">{e.date}</p>
                    </div>
                    <span className="text-sm font-bold gradient-text">{e.amount}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${
                      e.status === "Approved" ? "bg-green-500/20 text-green-400" : "bg-secondary/20 text-secondary"
                    }`}>{e.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-6 text-center mb-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl mb-3">{initials}</div>
                <h2 className="text-lg font-montserrat font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">Field Executive · Marketing</p>
                <p className="text-xs text-muted-foreground mt-1">EMP001 · Coimbatore</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Performance Score", value: "920 pts", icon: Trophy },
                  { label: "This Month Attendance", value: "95%", icon: Calendar },
                  { label: "Total Incentives", value: "₹15,000", icon: IndianRupee },
                ].map(item => (
                  <div key={item.label} className="glass-card p-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10"><item.icon className="w-4 h-4 text-primary" /></div>
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-sm font-bold gradient-text">{item.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleLogout}
                className="w-full mt-6 py-3 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 transition-all text-sm font-medium flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Face Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 w-full max-w-sm text-center">
              <h3 className="font-bold mb-3">Face Recognition</h3>
              <div className="relative w-48 h-36 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted/50 border-2 border-primary/30">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-28 h-36 border-2 border-dashed border-primary/50 rounded-[50%]" />
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={stopCamera} className="px-4 py-2 rounded-xl border border-border/50 text-sm">Cancel</button>
                <button onClick={doFaceCheckIn} disabled={!cameraReady} className="btn-gradient px-4 py-2 text-sm disabled:opacity-50">Verify</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-card border-t border-border/30 px-2 py-1 z-40">
        <div className="flex justify-around">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                tab === t.id ? "text-primary" : "text-muted-foreground"
              }`}>
              <t.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default EmployeePortal;
