import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Plus, Receipt, CheckCircle2, Clock, X, ShieldCheck, UserCheck, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const CATEGORIES = ["Petrol", "Bus", "Train", "Flight", "Taxi", "Auto", "Toll & Parking", "Staff meals", "Hotel stay", "Stationery", "Office materials", "Courier", "Food", "Paid Campaign", "Event Expense", "Inhouse Shoot", "Camera Rental"];

const statusColors: Record<string, string> = {
  "Submitted": "bg-blue-500/10 text-blue-400",
  "Verified": "bg-secondary/20 text-secondary",
  "Approved": "bg-green-500/20 text-green-400",
  "Rejected": "bg-destructive/20 text-destructive",
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  
  const [form, setForm] = useState({
    employeeId: "EMP-TEMP", // In real app, get from session
    employeeName: "Admin", 
    amount: "",
    expenseDate: new Date().toISOString().split('T')[0],
    category: "Petrol",
    remarks: ""
  });

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expenses/all");
      setExpenses(res.data);
    } catch (err) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filtered = filter === "All" ? expenses : expenses.filter(e => e.status === filter);

  const handleSubmit = async () => {
    if (!form.amount || !form.category) return toast.error("Please fill in amount and category");
    try {
      await axios.post("http://localhost:5000/api/expenses/submit", form);
      toast.success("Expense submitted successfully!");
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to submit expense");
    }
  };

  const handleAction = async (id: string, stage: 'verify' | 'approve', status: 'Verified' | 'Approved' | 'Rejected') => {
    try {
      const url = `http://localhost:5000/api/expenses/${stage}/${id}`;
      const body = stage === 'verify' 
        ? { managerName: "Manager Admin", status } 
        : { adminName: "Super Admin", status };
        
      await axios.put(url, body);
      toast.success(`Expense ${status} successfully`);
      fetchExpenses();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Expense Management</h1>
            <p className="text-muted-foreground text-sm">Review, verify and approve claims</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm font-semibold">
            <Plus className="w-4 h-4" /> New Claim
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {["All", "Submitted", "Verified", "Approved", "Rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === s ? "btn-gradient" : "glass-card text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
             <div className="text-center py-20 text-muted-foreground italic">Fetching records...</div>
        ) : (
            <div className="space-y-4">
            {filtered.map((exp, i) => (
              <motion.div key={exp.expenseId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                
                <div className="p-3 rounded-2xl bg-primary/10">
                    <Receipt className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{exp.category}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${statusColors[exp.status]}`}>
                        {exp.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-foreground/80"><Clock className="w-3 h-3" /> {exp.expenseDate}</span>
                    <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {exp.employeeName}</span>
                  </p>
                  {exp.remarks && <p className="text-xs text-muted-foreground mt-2 italic px-2 border-l-2 border-primary/30">"{exp.remarks}"</p>}
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Amount</p>
                        <p className="font-montserrat font-bold text-xl gradient-text">₹{exp.amount}</p>
                    </div>

                    <div className="flex gap-2">
                        {exp.status === "Submitted" && (
                            <>
                                <button onClick={() => handleAction(exp.expenseId, 'verify', 'Verified')} className="action-btn text-xs bg-secondary/10 text-secondary hover:bg-secondary/20">Verify</button>
                                <button onClick={() => handleAction(exp.expenseId, 'verify', 'Rejected')} className="action-btn text-xs bg-destructive/10 text-destructive hover:bg-destructive/20">Reject</button>
                            </>
                        )}
                        {exp.status === "Verified" && (
                            <>
                                <button onClick={() => handleAction(exp.expenseId, 'approve', 'Approved')} className="action-btn text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20">Approve</button>
                                <button onClick={() => handleAction(exp.expenseId, 'approve', 'Rejected')} className="action-btn text-xs bg-destructive/10 text-destructive hover:bg-destructive/20">Reject</button>
                            </>
                        )}
                        {exp.status === "Approved" && <div className="p-2 bg-green-500/20 rounded-xl"><ShieldCheck className="w-5 h-5 text-green-400" /></div>}
                    </div>
                </div>
              </motion.div>
            ))}
            </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-[#121212] border border-border/50 shadow-2xl rounded-2xl p-8 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
              
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted/50 transition-colors"><X className="w-6 h-6" /></button>

              <div className="mb-8">
                <h2 className="text-2xl font-montserrat font-bold mb-1">Submit Expense</h2>
                <p className="text-muted-foreground text-sm">Enter the details for reimbursement</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Expense Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="form-input" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Date</label>
                    <input type="date" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} className="form-input" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Remarks</label>
                  <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Brief description of expense..." className="form-input h-24 pt-3" />
                </div>

                <button onClick={handleSubmit} className="w-full py-4 btn-gradient rounded-2xl text-sm font-bold tracking-widest uppercase shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Submit Reimbursement Claim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Expenses;
