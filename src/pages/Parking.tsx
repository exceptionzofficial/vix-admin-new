import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Car, Zap, ParkingMeter } from "lucide-react";

const zones = [
  { name: "Zone A - Main Gate", capacity: 200, occupied: 134, charging: 8, chargingUsed: 5 },
  { name: "Zone B - East Wing", capacity: 150, occupied: 128, charging: 4, chargingUsed: 4 },
  { name: "Zone C - VIP Area", capacity: 50, occupied: 22, charging: 6, chargingUsed: 2 },
  { name: "Zone D - Staff", capacity: 80, occupied: 45, charging: 0, chargingUsed: 0 },
];

const Parking = () => (
  <DashboardLayout>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-montserrat font-bold mb-2">Parking & Charging</h1>
      <p className="text-muted-foreground text-sm mb-6">Real-time parking analytics for active events</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone, i) => {
          const pct = Math.round((zone.occupied / zone.capacity) * 100);
          return (
            <motion.div
              key={zone.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ParkingMeter className="w-5 h-5 text-primary" /> {zone.name}
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  pct > 80 ? "bg-accent/20 text-accent" : pct > 50 ? "bg-secondary/20 text-secondary" : "bg-green-500/20 text-green-400"
                }`}>
                  {pct}% Full
                </span>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-3xl font-bold font-montserrat gradient-text">{zone.occupied}</p>
                  <p className="text-xs text-muted-foreground">of {zone.capacity} slots</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: pct > 80 ? "var(--gradient-accent)" : "var(--gradient-primary)" }}
                      />
                    </div>
                  </div>
                  {zone.charging > 0 && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{zone.chargingUsed}/{zone.charging} EV charging in use</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg">{zone.capacity - zone.occupied} available</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  </DashboardLayout>
);

export default Parking;
