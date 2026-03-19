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

  // Grouping logic
  const groupExpenses = (data: any[]) => {
    const groups: Record<string, any[]> = {};
    data.forEach(item => {
      const key = `${item.employeeId}_${item.expenseDate}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.values(groups).sort((a, b) => new Date(b[0].expenseDate).getTime() - new Date(a[0].expenseDate).getTime());
  };

  const expenseGroups = groupExpenses(filtered);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Expense Management</h1>
            <p className="text-muted-foreground text-sm">Review, verify and approve claims (Grouped by Date)</p>
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
            <div className="space-y-6">
            {expenseGroups.map((group, groupIndex) => {
              const head = group[0];
              const total = group.reduce((sum, i) => sum + i.amount, 0);
              const groupStatus = group[0].status;

              return (
                <motion.div key={groupIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIndex * 0.05 }}
                  className="glass-card-hover p-6 border border-border/40 relative">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10">
                            <Receipt className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{head.employeeName}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1 font-medium text-foreground/80 bg-muted/50 px-2 py-0.5 rounded-md">
                                    <Clock className="w-3 h-3" /> {head.expenseDate}
                                </span>
                                <span className="uppercase tracking-tighter text-[9px] font-bold">{head.employeeId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Total Group Amount</p>
                        <p className="font-montserrat font-bold text-2xl gradient-text">₹{total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
                    {group.map((item: any) => (
                      <div key={item.expenseId} className="bg-muted/30 p-4 rounded-2xl border border-divider/5 flex justify-between items-center group relative">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-foreground/80 px-2 py-0.5 rounded bg-primary/5">{item.category}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${statusColors[item.status]}`}>
                                {item.status === 'Submitted' ? 'New Bill' : item.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic line-clamp-1">"{item.remarks || 'No remarks'}"</p>
                        </div>
                        <p className="font-bold text-sm ml-4">₹{item.amount}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end">
                      {groupStatus === "Submitted" && (
                          <>
                              <button onClick={() => group.forEach((it: any) => handleAction(it.expenseId, 'verify', 'Verified'))} 
                                className="action-btn text-xs bg-secondary/10 text-secondary hover:bg-secondary/20 h-10 px-6">Verify All</button>
                              <button onClick={() => group.forEach((it: any) => handleAction(it.expenseId, 'verify', 'Rejected'))} 
                                className="action-btn text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 h-10 px-6">Reject All</button>
                          </>
                      )}
                      {groupStatus === "Verified" && (
                          <>
                              <button onClick={() => group.forEach((it: any) => handleAction(it.expenseId, 'approve', 'Approved'))} 
                                className="action-btn text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 h-10 px-6">Approve All</button>
                              <button onClick={() => group.forEach((it: any) => handleAction(it.expenseId, 'approve', 'Rejected'))} 
                                className="action-btn text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 h-10 px-6">Reject All</button>
                          </>
                      )}
                      {groupStatus === "Approved" && (
                        <div className="flex items-center gap-2 text-green-400 font-bold text-xs bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                            <ShieldCheck className="w-4 h-4" /> BATCH APPROVED
                        </div>
                      )}
                  </div>
                </motion.div>
              );
            })}
            </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Expenses;
