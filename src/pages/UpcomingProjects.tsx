import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Rocket, Users, Calendar, MapPin, Link2, QrCode, Plus, X, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Project = {
  id: number;
  name: string;
  venue: string;
  date: string;
  status: "Registration Open" | "Planning" | "Confirmed";
  registrations: number;
  target: number;
  description: string;
};

const initialProjects: Project[] = [
  { id: 1, name: "Summer Carnival 2026", venue: "Coimbatore Fairgrounds", date: "Apr 15, 2026", status: "Registration Open", registrations: 1240, target: 5000, description: "Massive summer festival with rides, food stalls, and live music" },
  { id: 2, name: "Startup Expo India", venue: "Chennai Trade Center", date: "May 10, 2026", status: "Registration Open", registrations: 680, target: 2000, description: "India's biggest startup networking event" },
  { id: 3, name: "Auto Expo South", venue: "Madurai Exhibition Hall", date: "Jun 1, 2026", status: "Planning", registrations: 0, target: 10000, description: "Automotive exhibition featuring latest vehicles" },
  { id: 4, name: "Music Festival: Echoes", venue: "Ooty Hill Resort", date: "May 25, 2026", status: "Registration Open", registrations: 3200, target: 8000, description: "3-day music festival in the Nilgiris" },
  { id: 5, name: "Fashion Week Coimbatore", venue: "Grand Hall, Coimbatore", date: "Jul 5, 2026", status: "Confirmed", registrations: 450, target: 1500, description: "Premier fashion showcase for South India designers" },
];

const statusColors: Record<string, string> = {
  "Registration Open": "bg-green-500/20 text-green-400",
  Planning: "bg-secondary/20 text-secondary",
  Confirmed: "bg-primary/20 text-primary",
};

const UpcomingProjects = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", venue: "", date: "", description: "", target: "" });

  const handleCreate = () => {
    if (!form.name || !form.venue) return toast.error("Fill in project name and venue");
    setProjects(prev => [{
      id: prev.length + 1, name: form.name, venue: form.venue,
      date: form.date || "TBD", status: "Planning", registrations: 0,
      target: parseInt(form.target) || 1000, description: form.description || "",
    }, ...prev]);
    setShowCreateModal(false);
    setForm({ name: "", venue: "", date: "", description: "", target: "" });
    toast.success(`Project "${form.name}" created!`);
  };

  const regLink = selectedProject ? `https://crayonz.in/register/${selectedProject.id}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(regLink);
    toast.success("Registration link copied!");
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Upcoming Projects</h1>
            <p className="text-muted-foreground text-sm">{projects.length} projects in pipeline</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-gradient px-4 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Projects", value: projects.length, sub: "Active pipeline" },
            { label: "Total Registrations", value: projects.reduce((s, p) => s + p.registrations, 0).toLocaleString(), sub: "Across all projects" },
            { label: "Open for Registration", value: projects.filter(p => p.status === "Registration Open").length, sub: "Accepting visitors" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-5">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-montserrat font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Project List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 cursor-pointer" onClick={() => setSelectedProject(p)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{p.name}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.venue}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{p.registrations.toLocaleString()} / {p.target.toLocaleString()}</span>
                </div>
                <div className="h-2 w-24 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((p.registrations / p.target) * 100, 100)}%`, background: "var(--gradient-primary)" }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Project Detail / QR Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-montserrat font-bold">{selectedProject.name}</h2>
                <button onClick={() => setSelectedProject(null)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedProject.description}</p>
              
              {/* QR Code placeholder */}
              <div className="flex flex-col items-center py-6 glass-card rounded-xl mb-4">
                <div className="w-40 h-40 bg-foreground rounded-2xl flex items-center justify-center mb-3">
                  <QrCode className="w-32 h-32 text-background" />
                </div>
                <p className="text-xs text-muted-foreground">Scan to register</p>
              </div>

              {/* Registration Link */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 px-3 py-2 rounded-xl bg-muted/50 text-xs text-muted-foreground truncate flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  {regLink}
                </div>
                <button onClick={copyLink} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 text-center rounded-xl">
                  <p className="text-lg font-bold gradient-text">{selectedProject.registrations.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Registered</p>
                </div>
                <div className="glass-card p-3 text-center rounded-xl">
                  <p className="text-lg font-bold" style={{ color: "#FF7A00" }}>{selectedProject.target.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Target</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">New Project</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Project Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Carnival 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Venue</label>
                  <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Venue"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Target Registrations</label>
                    <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="5000"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                </div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="About the project..."
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" /></div>
                <button onClick={handleCreate} className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold">Create Project</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default UpcomingProjects;
