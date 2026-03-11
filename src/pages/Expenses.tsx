import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Plus, Receipt, CheckCircle2, Clock, X } from "lucide-react";
import { toast } from "sonner";

const initialExpenses = [
  { id: 1, title: "Travel - Client visit Salem", amount: "₹2,400", date: "Mar 5", employee: "Ravi Kumar", status: "Approved", type: "Travel" },
  { id: 2, title: "Poster printing - Tech Expo", amount: "₹8,500", date: "Mar 4", employee: "Karthik V", status: "Pending", type: "Materials" },
  { id: 3, title: "Venue advance - Marina Beach", amount: "₹50,000", date: "Mar 3", employee: "Priya S", status: "Approved", type: "Venue" },
  { id: 4, title: "Fuel - Field visits", amount: "₹1,200", date: "Mar 5", employee: "Divya R", status: "Pending", type: "Travel" },
  { id: 5, title: "Equipment rental - Lighting", amount: "₹15,000", date: "Mar 2", employee: "Arun M", status: "Rejected", type: "Equipment" },
];

const statusConfig: Record<string, { color: string }> = {
  "Approved": { color: "bg-green-500/20 text-green-400" },
  "Pending": { color: "bg-secondary/20 text-secondary" },
  "Rejected": { color: "bg-accent/20 text-accent" },
};

const Expenses = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", type: "Travel" });

  const handleSubmit = () => {
    if (!form.title || !form.amount) return toast.error("Fill in all fields");
    setExpenses(prev => [{ id: prev.length + 1, title: form.title, amount: `₹${form.amount}`, date: "Today", employee: "You", status: "Pending", type: form.type }, ...prev]);
    setShowModal(false);
    setForm({ title: "", amount: "", type: "Travel" });
    toast.success("Expense submitted for approval!");
  };

  const handleApprove = (id: number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "Approved" } : e));
    toast.success("Expense approved!");
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Expenses</h1>
            <p className="text-muted-foreground text-sm">Track and approve team expenses</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Submit Expense
          </button>
        </div>

        <div className="space-y-3">
          {expenses.map((exp, i) => {
            const config = statusConfig[exp.status];
            return (
              <motion.div key={exp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-4 flex items-center gap-4">
                <div className="p-2 rounded-xl bg-primary/10"><Receipt className="w-5 h-5 text-primary" /></div>
                <div className="flex-1">
                  <h3 className="font-medium">{exp.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{exp.employee} · {exp.date} · {exp.type}</p>
                </div>
                <span className="font-montserrat font-bold gradient-text">{exp.amount}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>{exp.status}</span>
                {exp.status === "Pending" && (
                  <button onClick={() => handleApprove(exp.id)} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all">
                    Approve
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">Submit Expense</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Description</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Travel to client" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="2500" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Travel</option><option>Materials</option><option>Venue</option><option>Equipment</option><option>Food</option>
                    </select></div>
                </div>
                <button onClick={handleSubmit} className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold">Submit Expense</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Expenses;
