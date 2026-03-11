import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  trend?: string;
  delay?: number;
  accent?: boolean;
}

const StatCard = ({ icon: Icon, label, value, suffix = "", trend, delay = 0, accent }: StatCardProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card-hover p-5 relative overflow-hidden group"
    >
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{label}</p>
          <p className={`text-3xl font-bold font-montserrat ${accent ? "gradient-accent-text" : "gradient-text"}`}>
            {count.toLocaleString()}{suffix}
          </p>
          {trend && (
            <p className="text-xs text-green-400 mt-1">↑ {trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${accent ? "bg-accent/10" : "bg-primary/10"}`}>
          <Icon className={`w-6 h-6 ${accent ? "text-accent" : "text-primary"}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
