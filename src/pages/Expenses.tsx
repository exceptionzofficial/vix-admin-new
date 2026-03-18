import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Receipt, CheckCircle2, Clock, X, ShieldCheck, UserCheck, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import API_CONFIG from "../config/api";

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
  const [filter, setFilter] = useState("All");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.API_BASE}/expenses/all`);
      setExpenses(res.data);
    } catch (err) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filtered = filter === "All" ? expenses : expenses.filter(e => e.status === filter);

  const handleAction = async (id: string, stage: 'verify' | 'approve', status: 'Verified' | 'Approved' | 'Rejected') => {
    try {
      const url = `${API_CONFIG.API_BASE}/expenses/${stage}/${id}`;
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
    </DashboardLayout>
  );
};

export default Expenses;
