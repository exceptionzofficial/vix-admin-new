import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MapPin, Star, Phone, Filter, ExternalLink, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";

const initialVendors = [
  { id: 1, name: "SoundPro Audio", category: "Sound System", location: "Chennai", rating: 4.8, priceRange: "₹15K-₹80K", jobs: 24, avatar: "SP" },
  { id: 2, name: "LightWorks Studio", category: "Lighting", location: "Coimbatore", rating: 4.6, priceRange: "₹10K-₹50K", jobs: 18, avatar: "LW" },
  { id: 3, name: "PrintMax Solutions", category: "Printing", location: "Erode", rating: 4.9, priceRange: "₹2K-₹20K", jobs: 45, avatar: "PM" },
  { id: 4, name: "StageKraft", category: "Stage Setup", location: "Salem", rating: 4.7, priceRange: "₹25K-₹2L", jobs: 12, avatar: "SK" },
  { id: 5, name: "FloralDreams", category: "Decorations", location: "Madurai", rating: 4.5, priceRange: "₹8K-₹40K", jobs: 30, avatar: "FD" },
  { id: 6, name: "MoveIt Transport", category: "Transport", location: "Chennai", rating: 4.3, priceRange: "₹5K-₹30K", jobs: 55, avatar: "MT" },
];

const categories = ["All", "Sound System", "Lighting", "Printing", "Stage Setup", "Decorations", "Transport"];

const Vendors = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [vendors, setVendors] = useState(initialVendors);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Sound System", location: "", priceRange: "" });

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || v.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    if (!form.name) return toast.error("Enter vendor name");
    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    setVendors(prev => [{ id: prev.length + 1, name: form.name, category: form.category, location: form.location || "TBD", rating: 4.0, priceRange: form.priceRange || "TBD", jobs: 0, avatar: initials }, ...prev]);
    setShowModal(false);
    setForm({ name: "", category: "Sound System", location: "", priceRange: "" });
    toast.success(`Vendor "${form.name}" added!`);
  };

  const handleCall = (name: string) => toast.info(`Calling ${name}...`);
  const handleQuote = (name: string) => toast.success(`Quote request sent to ${name}!`);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Vendor Marketplace</h1>
            <p className="text-muted-foreground text-sm">{vendors.length} verified vendors</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? "btn-gradient" : "glass-card text-muted-foreground hover:text-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <button className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all">
            <Filter className="w-4 h-4" /> Sort
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vendor, i) => (
            <motion.div key={vendor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5 cursor-pointer">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary font-bold">{vendor.avatar}</div>
                <div className="flex-1"><h3 className="font-semibold">{vendor.name}</h3><p className="text-xs text-muted-foreground">{vendor.category}</p></div>
                <div className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 text-primary fill-primary" /><span className="font-semibold">{vendor.rating}</span></div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {vendor.location}</div>
                <div className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5" /> {vendor.jobs} jobs completed</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <span className="text-sm text-muted-foreground">{vendor.priceRange}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleCall(vendor.name)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Phone className="w-4 h-4" /></button>
                  <button onClick={() => handleQuote(vendor.name)} className="px-3 py-1.5 btn-accent text-xs rounded-lg">Request Quote</button>
                </div>
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
                <h2 className="text-xl font-montserrat font-bold">Add Vendor</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Vendor Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. SoundPro" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                    </select></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Chennai" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                </div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Price Range</label>
                  <input value={form.priceRange} onChange={e => setForm(f => ({ ...f, priceRange: e.target.value }))} placeholder="₹10K-₹50K" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <button onClick={handleAdd} className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold">Add Vendor</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Vendors;
