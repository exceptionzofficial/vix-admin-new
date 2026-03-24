import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Clock, AlertCircle, MapPin, X, FileText, Briefcase, Calendar, Info, Clock8 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";
import axios from "axios";
import API_CONFIG from "../config/api";

// Constants for Categories and Types
const CATEGORIES = ["Poster", "Video", "Ai", "Events", "Inhouse Shoot", "Outside Shoot", "Dubbing", "Script", "Purchasing"];
const OUTPUT_TYPES = ["Landscape", "Portrait"];
const SOURCE_FILES = ["Drive", "Sourcing"];
const STATUSES = ["Start", "Completed", "Pending"];

const statusColors: Record<string, string> = {
  "Start": "bg-primary/20 text-primary",
  "Pending": "bg-secondary/20 text-secondary",
  "Completed": "bg-green-500/20 text-green-400",
};

const Tasks = () => {
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    role: "",
    eventName: "",
    date: new Date().toISOString().split('T')[0],
    location: "Office",
    tasks: [
      {
        sNo: 1,
        taskName: "",
        description: "",
        sourceFile: "Drive",
        category: "Poster",
        outputType: "Landscape",
        startTime: "",
        endTime: "",
        status: "Pending",
        remarks: ""
      }
    ]
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.API_BASE}/tasks/all`);
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchTasks(); 
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.API_BASE}/employee/all`);
      setEmployeesList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees");
    }
  };

  const ALL_EMPLOYEES_OPTION = { name: "All Employees", employeeId: "all-employees", designation: "All Roles", role: "All Roles", department: "All Departments", dept: "All Departments" };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(f => ({ ...f, employeeName: val }));
    const baseList = [ALL_EMPLOYEES_OPTION, ...employeesList];
    
    if (val.trim().length > 0) {
      const matches = baseList.filter(emp => emp.name?.toLowerCase().includes(val.toLowerCase()));
      setFilteredEmployees(matches);
    } else {
      setFilteredEmployees(baseList);
    }
  };

  const handleNameFocus = () => {
    const baseList = [ALL_EMPLOYEES_OPTION, ...employeesList];
    const val = form.employeeName;
    if (val.trim().length > 0) {
      const matches = baseList.filter(emp => emp.name?.toLowerCase().includes(val.toLowerCase()));
      setFilteredEmployees(matches);
    } else {
      setFilteredEmployees(baseList);
    }
  };

  const selectEmployee = (emp: any) => {
    setForm(f => ({
      ...f,
      employeeName: emp.name,
      employeeId: emp.employeeId || emp._id || "",
      role: emp.designation || emp.role || "",
      department: emp.department || emp.dept || "",
    }));
    setFilteredEmployees([]);
  };

  const filtered = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  const handleCreate = async () => {
    if (!form.employeeName || !form.eventName) return toast.error("Employee Name and Project Name are required");
    if (form.tasks.some(t => !t.taskName)) return toast.error("Task Name is required for all rows");

    try {
      const payload = form.tasks.map(t => ({
        ...t,
        employeeName: form.employeeName,
        employeeId: form.employeeId,
        department: form.department,
        role: form.role,
        eventName: form.eventName,
        date: form.date,
        location: form.location
      }));

      await axios.post(`${API_CONFIG.API_BASE}/tasks/submit`, payload);
      toast.success(`${payload.length} tasks created successfully!`);
      setShowModal(false);
      fetchTasks();
      
      // Reset form
      setForm({
        employeeName: "", employeeId: "", department: "", role: "", eventName: "",
        date: new Date().toISOString().split('T')[0], location: "Office",
        tasks: [{
          sNo: 1, taskName: "", description: "", sourceFile: "Drive", category: "Poster",
          outputType: "Landscape", startTime: "", endTime: "", status: "Pending", remarks: ""
        }]
      });
    } catch (err) {
      toast.error("Failed to create tasks");
    }
  };

  const addTaskRow = () => {
    setForm(f => ({
      ...f,
      tasks: [
        ...f.tasks,
        {
          sNo: f.tasks.length + 1,
          taskName: "",
          description: "",
          sourceFile: "Drive",
          category: "Poster",
          outputType: "Landscape",
          startTime: "",
          endTime: "",
          status: "Pending",
          remarks: ""
        }
      ]
    }));
  };

  const removeTaskRow = (index: number) => {
    if (form.tasks.length === 1) return;
    const newTasks = form.tasks.filter((_, i) => i !== index).map((t, i) => ({ ...t, sNo: i + 1 }));
    setForm(f => ({ ...f, tasks: newTasks }));
  };

  const updateTaskRow = (index: number, field: string, value: any) => {
    const newTasks = [...form.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setForm(f => ({ ...f, tasks: newTasks }));
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Daily Work Tasks</h1>
            <p className="text-muted-foreground text-sm">{tasks.length} total tasks recorded</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gradient px-5 py-2.5 flex items-center gap-2 text-sm font-semibold">
            <Plus className="w-4 h-4" /> New Task Entry
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {["All", ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === s ? "btn-gradient" : "glass-card text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
            <div className="text-center py-20 text-muted-foreground italic">Loading tasks...</div>
        ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tasks found. Create your first entry!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
            {filtered.map((task, i) => (
                <motion.div key={task.taskId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${task.status === "Completed" ? "bg-green-500/10" : "bg-primary/10"}`}>
                            <Briefcase className={`w-5 h-5 ${task.status === "Completed" ? "text-green-400" : "text-primary"}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                {task.sNo && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">#{task.sNo}</span>}
                                <h3 className="font-bold text-lg">{task.taskName}</h3>
                            </div>
                            <p className="text-xs text-primary font-medium tracking-wide">{task.eventName || "General Project"}</p>
                        </div>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${statusColors[task.status]}`}>{task.status}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Assignee</p>
                        <p className="font-medium flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />{task.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{task.role} · {task.department}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Time Logs</p>
                        <p className="font-medium flex items-center gap-1.5"><Clock8 className="w-3.5 h-3.5" />{task.startTime} - {task.endTime}</p>
                        <p className="text-xs text-muted-foreground">{task.date}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Details</p>
                        <p className="font-medium">{task.category}</p>
                        <p className="text-xs text-muted-foreground">{task.outputType} · {task.sourceFile}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Location</p>
                        <p className="font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{task.location}</p>
                    </div>
                </div>

                {task.description && (
                    <div className="mt-4 pt-4 border-t border-border/30 bg-muted/10 p-3 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">Description</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{task.description}</p>
                    </div>
                )}
                </motion.div>
            ))}
            </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-[#121212] border border-border/50 shadow-2xl rounded-2xl p-8 w-full max-w-4xl my-8 relative" onClick={e => e.stopPropagation()}>
              
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted/50 transition-colors"><X className="w-6 h-6" /></button>

              <div className="mb-8">
                <h2 className="text-2xl font-montserrat font-bold mb-1">New Task Entry</h2>
                <p className="text-muted-foreground text-sm">Fill in the details for the daily work log</p>
              </div>              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border">
                {/* Common Fields Section */}
                <div className="bg-muted/10 p-6 rounded-2xl border border-border/30">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Common Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Employee Name</label>
                      <input value={form.employeeName} onChange={handleNameChange} onFocus={handleNameFocus} onBlur={() => setTimeout(() => setFilteredEmployees([]), 200)} className="form-input" placeholder="Select Employee" />
                      {filteredEmployees.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-card border border-border/50 shadow-2xl rounded-xl max-h-48 overflow-y-auto">
                          {filteredEmployees.map(emp => (
                            <div key={emp.employeeId || emp._id} className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/10 last:border-0" onMouseDown={() => selectEmployee(emp)}>
                              <p className="text-sm font-bold text-foreground">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{emp.designation || emp.role || "Employee"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Event / Project Name</label>
                      <input value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} className="form-input" placeholder="Project name" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Date</label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="form-input [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Dept / Role</label>
                      <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value, department: e.target.value }))} className="form-input" placeholder="Role" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Location</label>
                      <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="form-input" placeholder="Office / Field" />
                    </div>
                  </div>
                </div>

                {/* Task Rows Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Work Task Entries</h3>
                    <button onClick={addTaskRow} className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest">
                      + Add Task Row
                    </button>
                  </div>

                  {form.tasks.map((task, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl border border-border/50 bg-card relative">
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-border rounded-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Task S.No: {task.sNo}</span>
                      </div>
                      
                      {form.tasks.length > 1 && (
                        <button onClick={() => removeTaskRow(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
                        <div className="lg:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Task Name</label>
                          <input value={task.taskName} onChange={e => updateTaskRow(idx, 'taskName', e.target.value)} className="form-input" placeholder="What was done?" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Category</label>
                          <select value={task.category} onChange={e => updateTaskRow(idx, 'category', e.target.value)} className="form-input">
                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Output Type</label>
                          <select value={task.outputType} onChange={e => updateTaskRow(idx, 'outputType', e.target.value)} className="form-input">
                            {OUTPUT_TYPES.map(o => <option key={o} value={o} className="bg-background">{o}</option>)}
                          </select>
                        </div>
                        <div className="lg:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Work Description</label>
                          <textarea value={task.description} onChange={e => updateTaskRow(idx, 'description', e.target.value)} className="form-input h-20 pt-3 resize-none" placeholder="Details..." />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Source File</label>
                          <select value={task.sourceFile} onChange={e => updateTaskRow(idx, 'sourceFile', e.target.value)} className="form-input">
                            {SOURCE_FILES.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Status</label>
                          <select value={task.status} onChange={e => updateTaskRow(idx, 'status', e.target.value)} className="form-input">
                            {STATUSES.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Start Time</label>
                          <input type="time" value={task.startTime} onChange={e => updateTaskRow(idx, 'startTime', e.target.value)} className="form-input [color-scheme:dark]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">End Time</label>
                          <input type="time" value={task.endTime} onChange={e => updateTaskRow(idx, 'endTime', e.target.value)} className="form-input [color-scheme:dark]" />
                        </div>
                        <div className="lg:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Remarks If any</label>
                          <input value={task.remarks} onChange={e => updateTaskRow(idx, 'remarks', e.target.value)} className="form-input" placeholder="Any notes?" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/30">
                <button onClick={handleCreate} className="w-full py-4 btn-gradient rounded-2xl text-sm font-bold tracking-widest uppercase shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Submit Task Log
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Tasks;
