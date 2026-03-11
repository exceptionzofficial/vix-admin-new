import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Calendar as CalIcon, MapPin, Users, Ticket, Filter, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";

const initialEvents = [
  { id: 1, name: "Tech Expo 2026", venue: "Chennai Convention Center", date: "Mar 15, 2026", visitors: 5000, ticketsSold: 3200, status: "Upcoming", revenue: "₹12.5L", organizer: "Crayonz Events" },
  { id: 2, name: "Sound & Light Festival", venue: "Marina Beach Grounds", date: "Mar 22, 2026", visitors: 15000, ticketsSold: 8500, status: "Tickets Live", revenue: "₹28L", organizer: "Crayonz Events" },
  { id: 3, name: "Startup Summit", venue: "Erode Tech Hub", date: "Apr 5, 2026", visitors: 800, ticketsSold: 650, status: "Planning", revenue: "₹4.2L", organizer: "Crayonz Biz" },
  { id: 4, name: "Wedding Expo", venue: "Coimbatore Palace Hall", date: "Apr 12, 2026", visitors: 2000, ticketsSold: 1800, status: "Upcoming", revenue: "₹8L", organizer: "Crayonz Weddings" },
  { id: 5, name: "Food Carnival", venue: "Salem Central Park", date: "Apr 20, 2026", visitors: 10000, ticketsSold: 4200, status: "Tickets Live", revenue: "₹15L", organizer: "Crayonz Events" },
  { id: 6, name: "Art & Culture Night", venue: "Madurai Heritage Center", date: "May 1, 2026", visitors: 1200, ticketsSold: 0, status: "Planning", revenue: "₹0", organizer: "Crayonz Culture" },
];

const Events = () => {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", venue: "", date: "", visitors: "" });

  const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!form.name || !form.venue) return toast.error("Please fill in event name and venue");
    const newEvent = {
      id: events.length + 1,
      name: form.name,
      venue: form.venue,
      date: form.date || "TBD",
      visitors: parseInt(form.visitors) || 0,
      ticketsSold: 0,
      status: "Planning",
      revenue: "₹0",
      organizer: "Crayonz Events",
    };
    setEvents(prev => [newEvent, ...prev]);
    setShowModal(false);
    setForm({ name: "", venue: "", date: "", visitors: "" });
    toast.success(`Event "${form.name}" created!`);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Events</h1>
            <p className="text-muted-foreground text-sm">{events.length} events this quarter</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <button className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  event.status === "Tickets Live" ? "bg-secondary/20 text-secondary" :
                  event.status === "Upcoming" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>{event.status}</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {event.venue}</div>
                <div className="flex items-center gap-2"><CalIcon className="w-3.5 h-3.5" /> {event.date}</div>
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Expected: {event.visitors.toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{event.ticketsSold.toLocaleString()} sold</span>
                </div>
                <span className="gradient-text font-bold font-montserrat">{event.revenue}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">Create Event</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted/50 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Event Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tech Expo 2026" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Venue</label>
                  <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. Chennai Convention Center" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Expected Visitors</label>
                    <input type="number" value={form.visitors} onChange={e => setForm(f => ({ ...f, visitors: e.target.value }))} placeholder="5000" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                </div>
                <button onClick={handleCreate} className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold">Create Event</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Events;
