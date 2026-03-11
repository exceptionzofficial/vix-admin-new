import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { MapPin, Navigation, Clock, Route, X, ChevronRight, User } from "lucide-react";

const employees = [
  { id: 1, name: "Ravi Kumar", status: "On Field", avatar: "RK", color: "#FFC107",
    route: [
      { lat: 11.0168, lng: 76.9558, label: "Office - Coimbatore", time: "9:00 AM" },
      { lat: 11.0250, lng: 76.9600, label: "Client - RS Traders", time: "10:30 AM" },
      { lat: 11.0400, lng: 76.9700, label: "Poster Distribution Area", time: "12:00 PM" },
      { lat: 11.0180, lng: 76.9520, label: "Lunch - Town Hall", time: "1:30 PM" },
      { lat: 11.0300, lng: 76.9650, label: "Vendor Meeting", time: "3:00 PM" },
    ],
    distance: "28.4 km", duration: "6h 15m", currentStop: 3,
  },
  { id: 2, name: "Priya Sharma", status: "At Event", avatar: "PS", color: "#FF0050",
    route: [
      { lat: 13.0827, lng: 80.2707, label: "Office - Chennai", time: "8:30 AM" },
      { lat: 13.0500, lng: 80.2500, label: "Marina Beach Venue", time: "10:00 AM" },
      { lat: 13.0520, lng: 80.2520, label: "Stage Setup Check", time: "11:30 AM" },
    ],
    distance: "15.2 km", duration: "4h 30m", currentStop: 2,
  },
  { id: 3, name: "Arun Mohan", status: "In Office", avatar: "AM", color: "#FF7A00",
    route: [
      { lat: 11.3410, lng: 77.7172, label: "Office - Erode", time: "9:00 AM" },
    ],
    distance: "0 km", duration: "In Office", currentStop: 0,
  },
  { id: 4, name: "Divya Raj", status: "On Field", avatar: "DR", color: "#8B5CF6",
    route: [
      { lat: 11.6643, lng: 78.1460, label: "Office - Salem", time: "9:15 AM" },
      { lat: 11.6700, lng: 78.1500, label: "Client Visit - Rajesh Ind.", time: "11:00 AM" },
      { lat: 11.6800, lng: 78.1600, label: "Follow-up Meeting", time: "2:00 PM" },
      { lat: 11.6650, lng: 78.1420, label: "Return to Office", time: "4:30 PM" },
    ],
    distance: "22.1 km", duration: "7h 15m", currentStop: 2,
  },
];

const mapLayers = ["Employees", "Events", "Vendors", "Parking"];

const LiveMap = () => {
  const [activeLayers, setActiveLayers] = useState<string[]>(["Employees"]);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
  const [employeePositions, setEmployeePositions] = useState<Record<number, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate employee movement
  useEffect(() => {
    const interval = setInterval(() => {
      setEmployeePositions(prev => {
        const next = { ...prev };
        employees.forEach(emp => {
          const maxStops = emp.route.length - 1;
          const current = prev[emp.id] ?? emp.currentStop;
          // Slowly cycle through stops
          next[emp.id] = current >= maxStops ? 0 : current + 0.02;
        });
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const cw = w / 2, ch = h / 2;

    // Clear
    ctx.fillStyle = "hsl(0, 0%, 8%)";
    ctx.fillRect(0, 0, cw, ch);

    // Draw grid (roads)
    ctx.strokeStyle = "hsl(0, 0%, 14%)";
    ctx.lineWidth = 1;
    for (let x = 0; x < cw; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
    }
    for (let y = 0; y < ch; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
    }

    // Draw major roads
    ctx.strokeStyle = "hsl(0, 0%, 20%)";
    ctx.lineWidth = 3;
    // Horizontal roads
    [ch * 0.3, ch * 0.5, ch * 0.7].forEach(y => {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
    });
    // Vertical roads
    [cw * 0.25, cw * 0.5, cw * 0.75].forEach(x => {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
    });

    // Draw building blocks
    ctx.fillStyle = "hsl(0, 0%, 12%)";
    const blocks = [
      [50, 50, 80, 60], [200, 80, 100, 70], [400, 40, 90, 80],
      [60, 200, 70, 90], [250, 220, 120, 60], [450, 180, 80, 100],
      [100, 350, 90, 70], [300, 380, 110, 50], [500, 340, 70, 90],
    ];
    blocks.forEach(([x, y, w, h]) => {
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "hsl(0, 0%, 16%)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    });

    // Label areas
    ctx.fillStyle = "hsl(0, 0%, 30%)";
    ctx.font = "10px Poppins, sans-serif";
    ctx.fillText("Commercial Zone", 55, 45);
    ctx.fillText("Tech Park", 210, 75);
    ctx.fillText("Market Area", 410, 35);
    ctx.fillText("Residential", 70, 195);
    ctx.fillText("Event Center", 260, 215);
    ctx.fillText("Industrial", 460, 175);

    if (activeLayers.includes("Employees")) {
      employees.forEach(emp => {
        const progress = employeePositions[emp.id] ?? emp.currentStop;
        const stopIdx = Math.floor(progress);
        const frac = progress - stopIdx;
        
        // Map employee positions to canvas coords
        const getPos = (idx: number) => {
          const basePositions: Record<number, [number, number][]> = {
            1: [[150, 150], [250, 120], [380, 200], [200, 300], [350, 350]],
            2: [[500, 100], [400, 250], [420, 280]],
            3: [[cw * 0.5, ch * 0.5]],
            4: [[100, 400], [200, 350], [350, 300], [150, 420]],
          };
          const positions = basePositions[emp.id] || [[cw/2, ch/2]];
          return positions[Math.min(idx, positions.length - 1)];
        };

        // Draw route
        if (emp.route.length > 1) {
          ctx.strokeStyle = emp.color + "40";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          for (let i = 0; i < emp.route.length; i++) {
            const [x, y] = getPos(i);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw completed route
          ctx.strokeStyle = emp.color + "80";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i <= Math.min(stopIdx + 1, emp.route.length - 1); i++) {
            const [x, y] = getPos(i);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Draw stops
          emp.route.forEach((_, i) => {
            const [x, y] = getPos(i);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = i <= stopIdx ? emp.color : "hsl(0, 0%, 25%)";
            ctx.fill();
            ctx.strokeStyle = emp.color;
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }

        // Draw current position (animated dot)
        const [x1, y1] = getPos(stopIdx);
        const [x2, y2] = getPos(Math.min(stopIdx + 1, emp.route.length - 1));
        const cx = x1 + (x2 - x1) * Math.min(frac, 1);
        const cy = y1 + (y2 - y1) * Math.min(frac, 1);

        // Glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
        gradient.addColorStop(0, emp.color + "60");
        gradient.addColorStop(1, emp.color + "00");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = emp.color;
        ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 6%)";
        ctx.font = "bold 7px Montserrat, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emp.avatar, cx, cy);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";

        // Name label
        ctx.fillStyle = emp.color;
        ctx.font = "bold 9px Poppins, sans-serif";
        ctx.fillText(emp.name.split(" ")[0], cx + 12, cy - 2);
        ctx.fillStyle = "hsl(0, 0%, 50%)";
        ctx.font = "8px Poppins, sans-serif";
        ctx.fillText(emp.status, cx + 12, cy + 10);
      });
    }

    // Draw event markers
    if (activeLayers.includes("Events")) {
      const eventLocations = [
        { x: 400, y: 260, name: "Tech Expo" },
        { x: 280, y: 140, name: "Sound Fest" },
      ];
      eventLocations.forEach(ev => {
        ctx.fillStyle = "#FF005040";
        ctx.beginPath();
        ctx.arc(ev.x, ev.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF0050";
        ctx.font = "bold 8px Poppins";
        ctx.fillText("🎪 " + ev.name, ev.x + 18, ev.y + 4);
      });
    }

    // Draw vendor markers
    if (activeLayers.includes("Vendors")) {
      const vendorLocations = [
        { x: 180, y: 280, name: "PrintMax" },
        { x: 480, y: 350, name: "SoundPro" },
      ];
      vendorLocations.forEach(v => {
        ctx.fillStyle = "#FF7A0040";
        ctx.beginPath();
        ctx.arc(v.x, v.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF7A00";
        ctx.font = "bold 8px Poppins";
        ctx.fillText("🏪 " + v.name, v.x + 15, v.y + 4);
      });
    }

    // Draw parking markers
    if (activeLayers.includes("Parking")) {
      const parkingLocations = [
        { x: 350, y: 230, name: "Zone A (67%)", pct: 0.67 },
        { x: 520, y: 150, name: "Zone B (85%)", pct: 0.85 },
      ];
      parkingLocations.forEach(p => {
        ctx.fillStyle = p.pct > 0.8 ? "#FF005030" : "#FFC10730";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.pct > 0.8 ? "#FF0050" : "#FFC107";
        ctx.font = "bold 8px Poppins";
        ctx.fillText("🅿️ " + p.name, p.x + 16, p.y + 4);
      });
    }
  }, [activeLayers, employeePositions]);

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev =>
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-montserrat font-bold">Live Map Intelligence</h1>
          <div className="flex gap-2">
            {mapLayers.map(l => (
              <button
                key={l}
                onClick={() => toggleLayer(l)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  activeLayers.includes(l)
                    ? "btn-gradient"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100%-4rem)]">
          {/* Map Canvas */}
          <div className="flex-1 glass-card rounded-2xl relative overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ imageRendering: "auto" }}
            />
            {/* Map overlay info */}
            <div className="absolute top-3 left-3 glass-card px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Live Tracking Active</span>
            </div>
          </div>

          {/* Employee List / Detail Panel */}
          <div className="w-72 glass-card rounded-2xl p-4 overflow-y-auto shrink-0">
            <AnimatePresence mode="wait">
              {selectedEmployee ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Travel History</h3>
                    <button onClick={() => setSelectedEmployee(null)} className="p-1 rounded-lg hover:bg-muted/50 transition-all">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/30">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: selectedEmployee.color + "30", color: selectedEmployee.color }}>
                      {selectedEmployee.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedEmployee.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedEmployee.status}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-muted/30 text-center">
                      <Route className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-bold gradient-text">{selectedEmployee.distance}</p>
                      <p className="text-[10px] text-muted-foreground">Distance</p>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/30 text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-secondary" />
                      <p className="text-xs font-bold" style={{ color: "#FF7A00" }}>{selectedEmployee.duration}</p>
                      <p className="text-[10px] text-muted-foreground">Duration</p>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Route Timeline</h4>
                  <div className="space-y-0">
                    {selectedEmployee.route.map((stop, i) => {
                      const currentPos = employeePositions[selectedEmployee.id] ?? selectedEmployee.currentStop;
                      const isVisited = i <= Math.floor(currentPos);
                      const isCurrent = i === Math.floor(currentPos);
                      return (
                        <div key={i} className="flex gap-3 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                              isCurrent ? "border-primary bg-primary" :
                              isVisited ? "border-primary bg-primary/50" :
                              "border-muted-foreground/30 bg-muted"
                            }`} />
                            {i < selectedEmployee.route.length - 1 && (
                              <div className={`w-0.5 h-12 ${isVisited ? "bg-primary/40" : "bg-muted"}`} />
                            )}
                          </div>
                          <div className={`pb-4 ${isCurrent ? "" : "opacity-60"}`}>
                            <p className="text-xs font-medium leading-tight">{stop.label}</p>
                            <p className="text-[10px] text-muted-foreground">{stop.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Field Employees
                  </h3>
                  <div className="space-y-2">
                    {employees.map(emp => (
                      <motion.button
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all text-left group"
                        whileHover={{ x: 4 }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: emp.color + "30", color: emp.color }}>
                          {emp.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.distance} · {emp.status}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default LiveMap;
