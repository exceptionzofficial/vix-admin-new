import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Send, Hash, Users, Pin, Smile } from "lucide-react";

const channels = [
  { name: "general", unread: 3 },
  { name: "events-team", unread: 0 },
  { name: "marketing", unread: 1 },
  { name: "tech-expo-2026", unread: 5 },
  { name: "vendors", unread: 0 },
];

const initialMessages = [
  { sender: "Priya S", text: "Stage setup confirmed for Marina Beach venue 🎉", time: "10:32 AM", avatar: "PS" },
  { sender: "Ravi Kumar", text: "Poster distribution 80% done in Coimbatore. Will finish by EOD.", time: "10:45 AM", avatar: "RK" },
  { sender: "Arun M", text: "Vendor meeting with LightWorks rescheduled to Thursday", time: "11:00 AM", avatar: "AM" },
  { sender: "Admin", text: "Great work team! Let's push for 100% completion before weekend.", time: "11:15 AM", avatar: "SA" },
  { sender: "Divya R", text: "Salem client confirmed 200 tickets booking for Tech Expo!", time: "11:30 AM", avatar: "DR" },
];

const Chat = () => {
  const [activeChannel, setActiveChannel] = useState("general");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setMessages(prev => [...prev, { sender: "You", text: input, time, avatar: "ME" }]);
    setInput("");
    // Simulated reply
    setTimeout(() => {
      const replies = [
        "Got it! Will follow up on that. 👍",
        "Thanks for the update!",
        "Sure, I'll take care of it right away.",
        "That's great news! 🎉",
        "Let me check and get back to you.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      setMessages(prev => [...prev, { sender: "Priya S", text: reply, time: replyTime, avatar: "PS" }]);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-3rem)] flex gap-4">
        {/* Channels */}
        <div className="w-56 glass-card p-4 rounded-2xl shrink-0">
          <h3 className="font-montserrat font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Channels
          </h3>
          <div className="space-y-1">
            {channels.map(ch => (
              <button
                key={ch.name}
                onClick={() => setActiveChannel(ch.name)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-all ${
                  activeChannel === ch.name ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="flex items-center gap-2"><Hash className="w-3.5 h-3.5" />{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">{ch.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="font-semibold">{activeChannel}</span>
            <Pin className="w-3.5 h-3.5 text-muted-foreground ml-auto cursor-pointer hover:text-foreground transition-colors" />
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < initialMessages.length ? i * 0.05 : 0 }}
                className={`flex items-start gap-3 ${msg.sender === "You" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === "You" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                }`}>
                  {msg.avatar}
                </div>
                <div className={msg.sender === "You" ? "text-right" : ""}>
                  <div className={`flex items-center gap-2 ${msg.sender === "You" ? "justify-end" : ""}`}>
                    <span className="font-medium text-sm">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className={`text-sm mt-0.5 inline-block px-3 py-1.5 rounded-xl ${
                    msg.sender === "You" ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                  }`}>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl glass-card hover:bg-muted/50 transition-all">
                <Smile className="w-4 h-4 text-muted-foreground" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message #${activeChannel}`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button onClick={handleSend} className="btn-gradient p-2.5 rounded-xl">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Chat;
