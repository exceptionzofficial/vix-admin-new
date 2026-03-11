import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { Settings as SettingsIcon, MapPin, Shield, Bell, Save } from "lucide-react";
import { toast } from "sonner";

interface Field {
  label: string;
  value: string;
  key: string;
  editable: boolean;
  type?: string;
}

interface Section {
  title: string;
  icon: typeof MapPin;
  description: string;
  fields: Field[];
}

const initialSections: Section[] = [
  {
    title: "Geofencing Settings",
    icon: MapPin,
    description: "Configure office and event geofence boundaries",
    fields: [
      { label: "Office Location", value: "11.3410° N, 77.7172° E (Erode)", key: "office_location", editable: true },
      { label: "Geofence Radius (meters)", value: "200", key: "geofence_radius", editable: true, type: "number" },
      { label: "Auto Clock-in", value: "Enabled", key: "auto_clockin", editable: true },
      { label: "Event Geofence Radius (meters)", value: "500", key: "event_radius", editable: true, type: "number" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    description: "Authentication and access control",
    fields: [
      { label: "Two-Factor Auth", value: "Enabled", key: "tfa", editable: true },
      { label: "Session Timeout (minutes)", value: "30", key: "session_timeout", editable: true, type: "number" },
      { label: "Password Policy", value: "Strong (8+ chars, special)", key: "password_policy", editable: false },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    description: "Manage alert preferences",
    fields: [
      { label: "Email Alerts", value: "Enabled", key: "email_alerts", editable: true },
      { label: "Push Notifications", value: "Enabled", key: "push_notif", editable: true },
      { label: "Daily Digest Time", value: "09:00", key: "digest_time", editable: true, type: "time" },
    ],
  },
];

const SettingsPage = () => {
  const [sections, setSections] = useState(initialSections);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const saveEdit = (sectionIdx: number, fieldIdx: number) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIdx] = {
        ...updated[sectionIdx],
        fields: updated[sectionIdx].fields.map((f, i) =>
          i === fieldIdx ? { ...f, value: editValue } : f
        ),
      };
      return updated;
    });
    setEditingKey(null);
    toast.success("Setting updated!");
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Settings</h1>
            <p className="text-muted-foreground text-sm">Admin configuration panel</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, si) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10"><section.icon className="w-5 h-5 text-primary" /></div>
                <div><h3 className="font-semibold">{section.title}</h3><p className="text-xs text-muted-foreground">{section.description}</p></div>
              </div>
              <div className="space-y-3">
                {section.fields.map((field, fi) => (
                  <div key={field.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
                    <span className="text-sm">{field.label}</span>
                    <div className="flex items-center gap-2">
                      {editingKey === field.key ? (
                        <>
                          <input
                            type={field.type || "text"}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && saveEdit(si, fi)}
                          />
                          <button onClick={() => saveEdit(si, fi)} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all">
                            <Save className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground">{field.value}</span>
                          {field.editable && (
                            <button onClick={() => startEdit(field.key, field.value)} className="text-xs text-primary hover:underline">Edit</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SettingsPage;
