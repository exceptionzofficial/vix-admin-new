import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MapPin, Phone, Mail, Filter, X, Lock, Fingerprint, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfDay, subMonths, addMonths } from "date-fns";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";
import axios from "axios";
import API_CONFIG from "../config/api";

const API_BASE_URL = API_CONFIG.API_BASE;

const Employees = () => {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [employeeLogs, setEmployeeLogs] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [form, setForm] = useState({ 
    employeeId: "", 
    pin: "", 
    name: "", 
    email: "", 
    dept: "", 
    designation: "", 
    location: "", 
    phone: "" 
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/employee/all`);
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (employeeId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/logs/${employeeId}`);
      setEmployeeLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const openDetails = (emp: any) => {
    setViewingEmployee(emp);
    fetchLogs(emp.employeeId);
  };

  const filtered = employees.filter(e =>
    (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.department || e.dept || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.employeeId || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.employeeId || !form.pin || !form.name || !form.email) {
      return toast.error("Please fill all required fields (ID, PIN, Name, Email)");
    }
    
    try {
      const payload = {
        employeeId: form.employeeId,
        pin: form.pin,
        name: form.name,
        email: form.email,
        department: form.dept || "General",
        role: form.designation || "Employee",
        location: form.location || "Erode",
        phone: form.phone || "N/A"
      };

      await axios.post(`${API_BASE_URL}/employee/add`, payload);
      toast.success(`${form.name} added successfully!`);
      setShowModal(false);
      setForm({ employeeId: "", pin: "", name: "", email: "", dept: "", designation: "", location: "", phone: "" });
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee. ID might already exist.");
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Employees</h1>
            <p className="text-muted-foreground text-sm">{employees.length} team members</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp, i) => (
              <motion.div key={emp.employeeId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} 
                className="glass-card-hover p-5 cursor-pointer"
                onClick={() => openDetails(emp)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {(emp.name || "E").split(" ").map((n: any) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{emp.name}</h3>
                      <p className="text-xs text-muted-foreground">{emp.role || emp.designation}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest">{emp.employeeId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${emp.faceId ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                      {emp.faceId ? "Registered" : "Pending Face"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {emp.location}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {emp.phone}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {emp.email}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-4 sm:p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">Add Employee</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><Fingerprint size={14} /> Employee ID</label>
                    <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="e.g. EMP001" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><Lock size={14} /> Security PIN</label>
                    <input type="password" maxLength={4} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} placeholder="4-digit pin" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email Address</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Department</label>
                    <select 
                      value={form.dept} 
                      onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} 
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Creative">Creative</option>
                      <option value="Event Execution">Event Execution</option>
                      <option value="HR & Finance">HR & Finance</option>
                      <option value="Internal Shoot Team">Internal Shoot Team</option>
                    </select>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Designation</label>
                    <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="Field Executive" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Erode" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                </div>
                <button onClick={handleAdd} className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold sticky bottom-0">Add Employee & Set Security</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details & Calendar Modal */}
      <AnimatePresence>
        {viewingEmployee && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" 
            onClick={() => setViewingEmployee(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
              className="glass-card p-0 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row" 
              onClick={e => e.stopPropagation()}
            >
              {/* Left Side: Profile Info */}
              <div className="md:w-1/3 bg-muted/20 p-6 border-r border-border/50 overflow-y-auto">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4">
                    {viewingEmployee.name.split(" ").map((n: any) => n[0]).join("")}
                  </div>
                  <h2 className="text-xl font-bold text-center">{viewingEmployee.name}</h2>
                  <p className="text-sm text-primary font-medium">{viewingEmployee.role || viewingEmployee.designation}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Security PIN</p>
                    <p className="text-lg font-mono font-bold tracking-widest text-primary">••••{viewingEmployee.pin?.slice(-1) || "*"}</p>
                    <p className="text-[9px] text-muted-foreground mt-1 underline cursor-pointer" onClick={() => toast.info(`Full PIN: ${viewingEmployee.pin}`)}>Reveal to Super Admin</p>
                  </div>

                  <DetailItem icon={<Fingerprint size={14}/>} label="Employee ID" value={viewingEmployee.employeeId} />
                  <DetailItem icon={<Mail size={14}/>} label="Email Address" value={viewingEmployee.email} />
                  <DetailItem icon={<Phone size={14}/>} label="Phone Number" value={viewingEmployee.phone} />
                  <DetailItem icon={<MapPin size={14}/>} label="Default Location" value={viewingEmployee.location} />
                  <DetailItem icon={<Filter size={14}/>} label="Department" value={viewingEmployee.department || viewingEmployee.dept} />
                </div>
              </div>

              {/* Right Side: Attendance Calendar */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Attendance History</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-muted/50 rounded-md"><ChevronLeft size={20}/></button>
                    <span className="text-sm font-bold min-w-[100px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-muted/50 rounded-md"><ChevronRight size={20}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-muted-foreground py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Calendar Days */}
                  {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10 md:h-14"></div>
                  ))}
                  {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map((date, i) => {
                    const status = getAttendanceStatus(date, employeeLogs);
                    return (
                      <div key={i} className={`h-10 md:h-14 rounded-lg flex flex-col items-center justify-center relative p-1 transition-all ${
                        isToday(date) ? 'ring-2 ring-primary ring-inset' : ''
                      } ${
                        status === 'present' ? 'bg-green-500/10' :
                        status === 'absent' ? 'bg-red-500/10' :
                        status === 'permission' ? 'bg-orange-500/10' : 'bg-muted/20'
                      }`}>
                        <span className={`text-xs font-bold ${
                          status === 'present' ? 'text-green-500' :
                          status === 'absent' ? 'text-red-500' :
                          status === 'permission' ? 'text-orange-500' : 'text-muted-foreground'
                        }`}>{format(date, "d")}</span>
                        {status && (
                          <div className={`w-1 h-1 rounded-full mt-1 ${
                            status === 'present' ? 'bg-green-500' :
                            status === 'absent' ? 'bg-red-500' : 'bg-orange-500'
                          }`} />
                        )}
                        {/* Status Label on Hover simulation */}
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center bg-background/80 rounded-lg text-[8px] font-bold cursor-default pointer-events-none">
                          {status ? status.toUpperCase() : 'N/A'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-green-500/5 border border-green-500/10">
                    <span className="text-2xl font-black text-green-500">{calculateStats(employeeLogs, 'present')}</span>
                    <span className="text-[10px] font-bold text-green-500/60 uppercase">Present</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <span className="text-2xl font-black text-red-500">{calculateStats(employeeLogs, 'absent')}</span>
                    <span className="text-[10px] font-bold text-red-500/60 uppercase">Absent</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                    <span className="text-2xl font-black text-orange-500">{calculateStats(employeeLogs, 'permission')}</span>
                    <span className="text-[10px] font-bold text-orange-500/60 uppercase">Permissions</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const DetailItem = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3">
    <div className="w-7 h-7 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted-foreground shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{label}</p>
      <p className="text-sm font-medium truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

const getAttendanceStatus = (date: Date, logs: any[]) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const log = logs.find(l => l.date === dateStr);
  if (log) return 'present';
  
  // Logic for absent vs future vs permission
  if (startOfDay(date) > startOfDay(new Date())) return null;
  
  // Sunday logic? For now let's just mark everything not present as absent
  return 'absent';
};

const calculateStats = (logs: any[], type: string) => {
  if (type === 'present') return logs.length;
  if (type === 'permission') return 0; // Placeholder for now
  if (type === 'absent') return 0; // Placeholder for now
  return 0;
};

export default Employees;
