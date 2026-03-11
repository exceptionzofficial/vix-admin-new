import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Clock, AlertCircle, MapPin, Camera, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";

const initialTasks = [
  { id: 1, title: "Distribute 500 posters in Coimbatore", assignee: "Ravi Kumar", location: "Coimbatore CBD", deadline: "Mar 8, 2026", priority: "High", status: "In Progress", proof: false },
  { id: 2, title: "Vendor meeting - SoundPro Audio", assignee: "Priya Sharma", location: "Chennai", deadline: "Mar 9, 2026", priority: "Medium", status: "Assigned", proof: false },
  { id: 3, title: "Expo booth setup inspection", assignee: "Arun Mohan", location: "Convention Center", deadline: "Mar 10, 2026", priority: "High", status: "Assigned", proof: true },
  { id: 4, title: "Client follow-up - Rajesh Industries", assignee: "Divya Raj", location: "Salem", deadline: "Mar 7, 2026", priority: "Low", status: "Completed", proof: true },
  { id: 5, title: "Collect banners from PrintMax", assignee: "Karthik V", location: "Erode", deadline: "Mar 8, 2026", priority: "Medium", status: "In Progress", proof: false },
  { id: 6, title: "Stage lighting test", assignee: "Sneha B", location: "Marina Beach", deadline: "Mar 12, 2026", priority: "High", status: "Assigned", proof: true },
];

const statusColors: Record<string, string> = {
  "Assigned": "bg-muted text-muted-foreground",
  "In Progress": "bg-secondary/20 text-secondary",
  "Completed": "bg-green-500/20 text-green-400",
};

const priorityColors: Record<string, string> = {
  "High": "bg-accent/20 text-accent",
  "Medium": "bg-primary/20 text-primary",
  "Low": "bg-muted text-muted-foreground",
};

const Tasks = () => {
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", assignee: "", location: "", deadline: "", priority: "Medium" });

  const statuses = ["All", "Assigned", "In Progress", "Completed"];
  const filtered = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  const handleCreate = () => {
    if (!form.title) return toast.error("Please enter a task title");
    setTasks(prev => [{
      id: prev.length + 1, title: form.title, assignee: form.assignee || "Unassigned",
      location: form.location || "TBD", deadline: form.deadline || "TBD",
      priority: form.priority, status: "Assigned", proof: false
    }, ...prev]);
    setShowModal(false);
    setForm({ title: "", assignee: "", location: "", deadline: "", priority: "Medium" });
    toast.success("Task created!");
  };

  const toggleStatus = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = t.status === "Assigned" ? "In Progress" : t.status === "In Progress" ? "Completed" : "Assigned";
      toast.success(`Task moved to ${next}`);
      return { ...t, status: next };
    }));
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Task Management</h1>
            <p className="text-muted-foreground text-sm">{tasks.length} tasks active</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? "btn-gradient" : "glass-card text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer" onClick={() => toggleStatus(task.id)}>
              <div className={`p-2 rounded-xl ${task.status === "Completed" ? "bg-green-500/10" : "bg-primary/10"}`}>
                {task.status === "Completed" ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                 task.status === "In Progress" ? <Clock className="w-5 h-5 text-secondary" /> :
                 <AlertCircle className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>{task.assignee}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>
                  <span>Due: {task.deadline}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.proof && <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg"><Camera className="w-3 h-3" /> Photo req.</span>}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[task.status]}`}>{task.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">Create Task</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Task Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Distribute posters" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Assignee</label>
                    <input value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Employee name" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                    </select></div>
                </div>
                <button onClick={handleCreate} className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold">Create Task</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Tasks;
