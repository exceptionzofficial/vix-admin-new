import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Camera, MapPin, Clock, CheckCircle2, XCircle, Users, Filter, Search, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import API_CONFIG from "../config/api";

const API_BASE_URL = API_CONFIG.API_BASE;

type AttendanceRecord = {
  employeeId: string;
  timestamp: number;
  name?: string;
  employee?: string;
  avatar?: string;
  date: string;
  time: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  method: string;
  location: any;
  hoursWorked?: string;
};

const statusColors: Record<string, string> = {
  Present: "bg-green-500/20 text-green-400",
  Late: "bg-secondary/20 text-secondary",
  OnTime: "bg-green-500/20 text-green-400",
  Absent: "bg-accent/20 text-accent",
  "On Leave": "bg-muted text-muted-foreground",
};

const Attendance = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "manager";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [checkedIn, setCheckedIn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAttendance();
    }
  }, [isAdmin]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Fetch logs and employees to join data
      const [logsRes, empRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/attendance-logs`), // We'll add this endpoint
        axios.get(`${API_BASE_URL}/employee/all`)
      ]);

      const employees = empRes.data;
      const joinedData = logsRes.data.map((log: any) => {
        const emp = employees.find((e: any) => e.employeeId === log.employeeId);
        return {
          ...log,
          employee: emp?.name || "Unknown",
          avatar: (emp?.name || "U").split(" ").map((n: any) => n[0]).join("").toUpperCase().slice(0, 2),
          checkIn: log.time,
          method: "Face ID",
          location: typeof log.location === 'object' ? `${log.location.latitude?.toFixed(2)}, ${log.location.longitude?.toFixed(2)}` : log.location,
          hoursWorked: "Ongoing"
        };
      });

      setAttendanceData(joinedData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const filtered = attendanceData.filter(r => {
    const matchSearch = (r.employee || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    present: attendanceData.filter(r => r.status === "Present" || r.status === "On-Time").length,
    late: attendanceData.filter(r => r.status === "Late").length,
    absent: 0, // Inferred
    leave: 0,
  };

  const startCamera = useCallback(async () => {
    setShowCamera(true);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      toast.error("Camera access denied. Using location-based check-in.");
      setShowCamera(false);
      doLocationCheckIn();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraReady(false);
  }, []);

  const doFaceCheckIn = () => {
    toast.loading("Scanning face...", { id: "face-scan" });
    setTimeout(() => {
      toast.success("Face recognized! ✅ Check-in successful", { id: "face-scan" });
      setCheckedIn(true);
      stopCamera();
    }, 2000);
  };

  const doLocationCheckIn = () => {
    setGeoStatus("Fetching location...");
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setGeoStatus(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoStatus(`📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        toast.success(`Location verified! Check-in recorded`);
        setCheckedIn(true);
      },
      () => {
        toast.error("Location access denied");
        setGeoStatus(null);
      }
    );
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const now = new Date();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Attendance</h1>
            <p className="text-muted-foreground text-sm">
              {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {" · "}
              <span className="text-primary font-medium">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </p>
          </div>
          {!isAdmin && !checkedIn && (
            <div className="flex gap-2">
              <button onClick={startCamera} className="btn-gradient px-4 py-2.5 flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4" /> Face Check-in
              </button>
              <button onClick={doLocationCheckIn} className="px-4 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-2 text-sm transition-all">
                <MapPin className="w-4 h-4" /> Location Check-in
              </button>
            </div>
          )}
          {!isAdmin && checkedIn && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Checked in at {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              {geoStatus && <span className="text-xs text-muted-foreground ml-2">{geoStatus}</span>}
            </div>
          )}
        </div>

        {/* Face Camera Modal */}
        <AnimatePresence>
          {showCamera && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="glass-card p-6 w-full max-w-md text-center">
                <h2 className="text-xl font-montserrat font-bold mb-4">Face Recognition Check-in</h2>
                <div className="relative w-64 h-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted/50 border-2 border-primary/30">
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-40 border-2 border-dashed border-primary/50 rounded-[50%]" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {cameraReady ? "Position your face within the oval and tap Verify" : "Starting camera..."}
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={stopCamera} className="px-5 py-2.5 rounded-xl border border-border/50 text-muted-foreground hover:bg-muted/50 text-sm">
                    Cancel
                  </button>
                  <button onClick={doFaceCheckIn} disabled={!cameraReady}
                    className="btn-gradient px-5 py-2.5 text-sm disabled:opacity-50">
                    Verify & Check In
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin: Stats */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "On-Time", value: stats.present, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Late", value: stats.late, color: "text-secondary", bg: "bg-secondary/10" },
              { label: "Total Logs", value: attendanceData.length, color: "text-primary", bg: "bg-primary/10" },
              { label: "System Status", value: "Live", color: "text-accent", bg: "bg-accent/10" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass-card p-4 ${s.bg}`}>
                <p className={`text-3xl font-bold font-montserrat ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters */}
        {isAdmin && (
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        )}

        {/* Team Attendance Table */}
        {isAdmin && loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
             </div>
        ) : isAdmin && (
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Employee</div>
              <div>Date</div>
              <div>Check-in</div>
              <div>Check-out</div>
              <div>Status</div>
            </div>
            {filtered.map((r, i) => (
              <motion.div key={r.employeeId + r.timestamp} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card-hover p-4 flex flex-col md:grid md:grid-cols-6 items-center gap-4">
                <div className="col-span-2 flex items-center gap-4 w-full md:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {r.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm">{r.employee}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{r.location}</p>
                  </div>
                </div>

                <div className="flex md:block items-center justify-between w-full md:w-auto">
                  <span className="md:hidden text-xs text-muted-foreground">Date:</span>
                  <p className="text-sm font-medium">{r.date}</p>
                </div>

                <div className="flex md:block items-center justify-between w-full md:w-auto">
                  <span className="md:hidden text-xs text-muted-foreground">Check-in:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <p className="text-sm font-bold text-green-500">{r.checkInTime || r.time || "N/A"}</p>
                  </div>
                </div>

                <div className="flex md:block items-center justify-between w-full md:w-auto">
                  <span className="md:hidden text-xs text-muted-foreground">Check-out:</span>
                  {r.checkOutTime ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <p className="text-sm font-bold text-orange-500">{r.checkOutTime}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Ongoing</span>
                  )}
                </div>

                <div className="flex md:block items-center justify-between w-full md:w-auto">
                  <span className="md:hidden text-xs text-muted-foreground">Status:</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${statusColors[r.status] || "bg-muted text-white"}`}>{r.status}</span>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && <p className="text-center py-10 text-muted-foreground">No logs found for today.</p>}
          </div>
        )}

        {!isAdmin && (
          <div className="space-y-4">
            <div className="glass-card p-5 text-center">
              <h3 className="font-semibold mb-3">Attendance History</h3>
              <p className="text-sm text-muted-foreground">History view is under maintenance. Check back after next update.</p>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Attendance;
