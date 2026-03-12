import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Search, Trash2, Edit, CheckSquare, Settings, Navigation, Navigation2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";
import axios from "axios";
import API_CONFIG from "../config/api";
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';

const API_BASE_URL = API_CONFIG.API_BASE;

const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 11.251973018188477,
  lng: 77.97372436523438
};

const Geofence = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyBQ89vG0RctMSMiFrLI4yWoopxxRzzeyxM", // Replace with env var in production
    libraries
  });

  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("branch"); // "branch" or "event"
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    ruleId: "",
    type: "branch", // branch or event
    eventName: "Main Branch",
    employeeId: "All",
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    radius: 100,
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/geofences`);
      setRules(res.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast.error("Failed to load geofence rules");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (ev: google.maps.MapMouseEvent) => {
    if (ev.latLng) {
      const lat = ev.latLng.lat();
      const lng = ev.latLng.lng();
      setForm(f => ({ ...f, lat, lng }));
      setMapCenter({ lat, lng });
    }
  };

  const handleManualCoordChange = (field: 'lat' | 'lng', value: string) => {
    const num = parseFloat(value);
    setForm(f => ({ ...f, [field]: value }));
    if (!isNaN(num)) {
      setMapCenter(prev => ({ ...prev, [field]: num }));
    }
  };

  const handleSave = async () => {
    if (!form.lat || !form.lng || !form.radius) {
      return toast.error("Please provide valid coordinates and radius");
    }
  
    const payload = {
      employeeId: form.type === "branch" ? "All" : form.employeeId,
      eventName: form.type === "branch" ? "Main Branch" : form.eventName,
      location: { latitude: Number(form.lat), longitude: Number(form.lng) },
      radius: Number(form.radius),
      startTime: "09:00 AM", // default or can be added to form
      date: new Date().toISOString().split('T')[0]
    };
  
    try {
      if (form.ruleId) {
        await axios.put(`${API_BASE_URL}/admin/geofence/${form.ruleId}`, payload);
        toast.success("Rule updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/admin/set-geofence`, payload);
        toast.success("Rule created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save geofence rule");
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (window.confirm("Are you sure you want to delete this geofence?")) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/geofence/${ruleId}`);
        toast.success("Rule deleted");
        fetchRules();
      } catch (error) {
        toast.error("Failed to delete rule");
      }
    }
  };

  const openEditMode = (rule: any) => {
    const isBranch = rule.employeeId === "All" || rule.eventName === "Main Branch";
    setForm({
      ruleId: rule.ruleId,
      type: isBranch ? "branch" : "event",
      eventName: rule.eventName,
      employeeId: rule.employeeId || "All",
      lat: rule.location.latitude,
      lng: rule.location.longitude,
      radius: rule.radius
    });
    setMapCenter({ lat: rule.location.latitude, lng: rule.location.longitude });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      ruleId: "",
      type: activeTab,
      eventName: activeTab === "branch" ? "Main Branch" : "",
      employeeId: activeTab === "branch" ? "All" : "",
      lat: defaultCenter.lat,
      lng: defaultCenter.lng,
      radius: 100,
    });
    setMapCenter(defaultCenter);
  };

  const filteredRules = rules.filter(r => {
    const isBranch = r.employeeId === "All" || r.eventName === "Main Branch";
    const matchesTab = activeTab === "branch" ? isBranch : !isBranch;
    const matchesSearch = (r.eventName || "").toLowerCase().includes(search.toLowerCase()) || 
                          (r.employeeId || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Geofence Management</h1>
            <p className="text-muted-foreground text-sm">Configure branch and event location boundaries.</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Geofence
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-muted/30 p-1 rounded-xl w-max mb-6">
          <button 
            onClick={() => setActiveTab("branch")} 
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "branch" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Branch Locations
          </button>
          <button 
            onClick={() => setActiveTab("event")} 
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "event" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Event Locations
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rules..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">No geofence rules found for this category.</div>
            ) : (
              filteredRules.map((rule, i) => (
                <motion.div key={rule.ruleId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent"></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{rule.eventName}</h3>
                      <p className="text-xs font-semibold text-primary bg-primary/10 w-max px-2 py-0.5 rounded-full mt-1">
                        {rule.employeeId === 'All' ? 'All Employees' : `EMP ID: ${rule.employeeId}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditMode(rule)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(rule.ruleId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Navigation2 className="w-3.5 h-3.5" /> Coordinates</span>
                      <span className="font-mono text-xs">{rule.location?.latitude?.toFixed(4)}, {rule.location?.longitude?.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Radius</span>
                      <span className="font-semibold">{rule.radius}m</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Geofence Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-0 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
              
              {/* Map Section */}
              <div className="w-full md:w-[55%] bg-muted/20 relative p-4 border-r border-border/50">
                <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Mark Location</h3>
                <div className="rounded-xl overflow-hidden border border-border/50 shadow-inner">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={16}
                      onClick={handleMapClick}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    >
                      <Marker position={{ lat: Number(form.lat), lng: Number(form.lng) }} />
                      <Circle
                        center={{ lat: Number(form.lat), lng: Number(form.lng) }}
                        radius={Number(form.radius)}
                        options={{
                          fillColor: '#FF007F',
                          fillOpacity: 0.2,
                          strokeColor: '#FF007F',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center bg-muted/50">Loading Map...</div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Click anywhere on the map to set the geofence center.</p>
              </div>

              {/* Form Section */}
              <div className="w-full md:w-[45%] p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-montserrat font-bold">{form.ruleId ? 'Edit Geofence' : 'New Geofence'}</h2>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.type === 'branch'} onChange={() => setForm(f => ({ ...f, type: 'branch', eventName: f.eventName || 'Main Branch', employeeId: 'All' }))} className="accent-primary" />
                      <span className="text-sm font-medium">Branch</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.type === 'event'} onChange={() => setForm(f => ({ ...f, type: 'event', eventName: '', employeeId: '' }))} className="accent-primary" />
                      <span className="text-sm font-medium">Specific Event</span>
                    </label>
                  </div>

                  {form.type === "branch" && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Branch Name</label>
                      <input value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} placeholder="e.g. Main Branch, Erode HQ" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  )}

                  {form.type === "event" && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Event Name</label>
                        <input value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} placeholder="e.g. Corporate Meetup" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Target Employee ID</label>
                        <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="e.g. EMP001 (or 'All')" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                    </>
                  )}

                  {/* Auto-fetch Location */}
                  <div className="p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast.error("Geolocation is not supported by your browser");
                          return;
                        }
                        toast.loading("Fetching your location...", { id: "geo" });
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            setForm(f => ({ ...f, lat, lng }));
                            setMapCenter({ lat, lng });
                            toast.success(`Location detected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, { id: "geo" });
                          },
                          (error) => {
                            console.error("Geolocation error:", error);
                            toast.error("Failed to fetch location. Please allow location access.", { id: "geo" });
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      Use My Current Location
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">Auto-detects your browser's GPS coordinates</p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border/50"></div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">or enter manually</span>
                    <div className="flex-1 h-px bg-border/50"></div>
                  </div>

                  {/* Manual coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Latitude</label>
                      <input type="number" step="any" value={form.lat} onChange={e => handleManualCoordChange('lat', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Longitude</label>
                      <input type="number" step="any" value={form.lng} onChange={e => handleManualCoordChange('lng', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Radius (meters)</label>
                    <div className="flex items-center gap-4">
                      <input type="range" min="10" max="1000" step="10" value={form.radius} onChange={e => setForm(f => ({ ...f, radius: Number(e.target.value) }))} className="flex-1 accent-primary" />
                      <input type="number" value={form.radius} onChange={e => setForm(f => ({ ...f, radius: Number(e.target.value) }))} className="w-20 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-center font-bold text-primary focus:outline-none" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">Visible on map instantly</p>
                  </div>

                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-2.5 btn-gradient rounded-xl text-sm font-semibold shadow-lg shadow-primary/25">Save Geofence</button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Geofence;
