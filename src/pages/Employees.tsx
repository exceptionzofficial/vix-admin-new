import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MapPin, Phone, Mail, Filter, X, Lock, Fingerprint } from "lucide-react";
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
              <motion.div key={emp.employeeId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5 cursor-pointer">
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
                  <div><label className="text-sm text-muted-foreground mb-1 block">Department</label>
                    <input value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} placeholder="Marketing" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
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
    </DashboardLayout>
  );
};

export default Employees;
