import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calendar, CheckCircle2, Clock, XCircle, Filter, 
    Search, User, MessageCircle, MoreVertical,
    FileText, CalendarDays, AlertCircle
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";
import axios from "axios";
import API_CONFIG from "../config/api";

const API_BASE_URL = API_CONFIG.API_BASE;

const Leaves = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminComment, setAdminComment] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/leave/all-requests`);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load request applications");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId: string, status: string) => {
        try {
            await axios.put(`${API_BASE_URL}/leave/update-status/${requestId}`, {
                status,
                adminComment
            });
            toast.success(`Request ${status} successfully`);
            setSelectedRequest(null);
            setAdminComment("");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = (r.employeeName || "").toLowerCase().includes(search.toLowerCase()) || 
                              (r.employeeId || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === "All" || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-700 border-green-200";
            case "Rejected": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-amber-100 text-amber-700 border-amber-200";
        }
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-montserrat font-bold">Leave & Permission Requests</h1>
                        <p className="text-muted-foreground text-sm">Review and manage employee leave applications.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            placeholder="Search by employee name or ID..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                        />
                    </div>
                    <div className="flex bg-muted/30 p-1 rounded-xl w-full md:w-max">
                        {["All", "Pending", "Approved", "Rejected"].map((status) => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRequests.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-muted-foreground">No matching requests found.</div>
                        ) : (
                            filteredRequests.map((req, i) => (
                                <motion.div 
                                    key={req.requestId} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card-hover p-5 border border-border/50 relative overflow-hidden flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                                {req.type === "Leave" ? <CalendarDays className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm">{req.employeeName}</h3>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{req.employeeId}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Type</span>
                                            <span className="text-xs font-bold text-primary">{req.type === "Leave" ? req.leaveType : `Permission (${req.duration})`}</span>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Date</p>
                                                <p className="text-xs font-medium">{req.startDate}{req.endDate !== req.startDate ? ` - ${req.endDate}` : ''}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Reason</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 italic">"{req.reason}"</p>
                                        </div>
                                    </div>

                                    {req.status === "Pending" && (
                                        <div className="mt-5 pt-4 border-t border-border/50 flex gap-2">
                                            <button 
                                                onClick={() => setSelectedRequest(req)}
                                                className="flex-1 py-2 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-primary/90 transition-all uppercase tracking-wider shadow-lg shadow-primary/20"
                                            >
                                                Respond
                                            </button>
                                        </div>
                                    )}

                                    {req.adminComment && (
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Admin Remark</p>
                                            <p className="text-xs text-green-600 font-medium italic">{req.adminComment}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </motion.div>

            {/* Response Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedRequest(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md relative z-50 shadow-2xl"
                        >
                            <h2 className="text-lg font-bold mb-1">Request Response</h2>
                            <p className="text-muted-foreground text-xs mb-6">Responding to {selectedRequest.employeeName}'s {selectedRequest.type} request.</p>
                            
                            <div className="space-y-4">
                                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Reason</span>
                                        <span className="text-[10px] font-bold text-primary uppercase">{selectedRequest.leaveType || selectedRequest.duration}</span>
                                    </div>
                                    <p className="text-sm italic">"{selectedRequest.reason}"</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Admin Comment (Optional)</label>
                                    <textarea 
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        placeholder="Add a remark (e.g. 'Project deadline pending', 'Approved for health')"
                                        className="w-full p-3 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedRequest.requestId, "Rejected")}
                                        className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-all uppercase tracking-wider"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedRequest.requestId, "Approved")}
                                        className="flex-1 py-3 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all uppercase tracking-wider shadow-lg shadow-green-500/25"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Leaves;
