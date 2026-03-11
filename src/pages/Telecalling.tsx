import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Phone, Clock, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const calls = [
  { name: "Rajesh Industries", number: "+91 98765 00001", duration: "4:32", type: "outgoing", status: "Converted", agent: "Divya R", time: "10:30 AM" },
  { name: "Lakshmi Textiles", number: "+91 98765 00002", duration: "2:15", type: "incoming", status: "Follow-up", agent: "Karthik V", time: "11:00 AM" },
  { name: "SS Enterprises", number: "+91 98765 00003", duration: "6:48", type: "outgoing", status: "Interested", agent: "Divya R", time: "11:45 AM" },
  { name: "Metro Events", number: "+91 98765 00004", duration: "1:22", type: "incoming", status: "No Answer", agent: "Karthik V", time: "12:15 PM" },
  { name: "ABC Corporates", number: "+91 98765 00005", duration: "8:10", type: "outgoing", status: "Converted", agent: "Divya R", time: "2:00 PM" },
];

const statusColors: Record<string, string> = {
  "Converted": "bg-green-500/20 text-green-400",
  "Follow-up": "bg-secondary/20 text-secondary",
  "Interested": "bg-primary/20 text-primary",
  "No Answer": "bg-muted text-muted-foreground",
};

const Telecalling = () => (
  <DashboardLayout>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-montserrat font-bold mb-2">Telecalling CRM</h1>
      <p className="text-muted-foreground text-sm mb-6">Today's call activity</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Calls", value: "23", sub: "Today" },
          { label: "Converted", value: "8", sub: "34.8%" },
          { label: "Avg Duration", value: "4:15", sub: "minutes" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
            <p className="text-3xl font-bold font-montserrat gradient-text">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {calls.map((call, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer"
          >
            <div className={`p-2 rounded-xl ${call.type === "outgoing" ? "bg-primary/10" : "bg-secondary/10"}`}>
              {call.type === "outgoing" ? <ArrowUpRight className="w-5 h-5 text-primary" /> : <ArrowDownLeft className="w-5 h-5 text-secondary" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">{call.name}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{call.number}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{call.duration}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{call.agent}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{call.time}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[call.status]}`}>{call.status}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </DashboardLayout>
);

export default Telecalling;
