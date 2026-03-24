import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, Clock, CheckCircle, XCircle, 
  Search, Filter, ChevronRight, MessageSquare, 
  DollarSign, Briefcase, Layers, Home, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'sonner';
import API_CONFIG from '../config/api';

interface PersonalRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  type: string;
  amount: number;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminComment: string;
  timestamp: number;
}

const PersonalRequests = () => {
  const [requests, setRequests] = useState<PersonalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PersonalRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.API_BASE}${API_CONFIG.ENDPOINTS.PERSONAL_REQUESTS}/all`);
      setRequests(response.data);
    } catch (err) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
    try {
      await axios.put(`${API_CONFIG.API_BASE}${API_CONFIG.ENDPOINTS.PERSONAL_REQUESTS}/update-status/${requestId}`, {
        status,
        adminComment
      });
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      setAdminComment('');
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filtered = requests.filter(req => {
    const matchesFilter = filter === 'All' || req.status === filter;
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'Salary In Advance': return <DollarSign className="w-4 h-4" />;
      case 'Travel Advance': return <Briefcase className="w-4 h-4" />;
      case 'Handloan': return <Layers className="w-4 h-4" />;
      case 'WFH': return <Home className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
        {/* Header section... */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-montserrat font-black tracking-tight text-foreground flex items-center gap-3">
              Personal <span className="text-primary italic">Requests</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Manage and review employee personal requests & advances</p>
          </div>

          <div className="flex items-center gap-3 bg-card/50 p-2 rounded-2xl border border-border/50 backdrop-blur-xl">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  filter === f 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                  : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by employee or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/50 border border-border/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-card/50 rounded-3xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((req) => (
              <motion.div
                key={req.requestId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                      req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                    }`}>
                      {getIcon(req.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{req.employeeName}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{req.type}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                    req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                    req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                  }`}>
                    {req.status}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {req.amount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/10">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</span>
                      <span className="text-lg font-black text-primary">₹{req.amount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {req.date}
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl min-h-[60px]">
                    <p className="text-sm text-foreground/80 italic leading-relaxed">
                      "{req.reason}"
                    </p>
                  </div>
                </div>

                {req.status === 'Pending' ? (
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                  >
                    Review Request <ChevronRight className="w-4 h-4" />
                  </button>
                ) : req.adminComment && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3 h-3 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Admin Comment</p>
                        <p className="text-xs text-foreground/70">{req.adminComment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border shadow-2xl rounded-[2.5rem] w-full max-w-xl overflow-hidden"
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-montserrat font-black tracking-tight">Review <span className="text-primary">Request</span></h2>
                  <p className="text-muted-foreground text-sm font-medium">{selectedRequest.employeeName} • {selectedRequest.type}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <XCircle className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Submission Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Date</p>
                      <p className="font-bold">{selectedRequest.date}</p>
                    </div>
                    {selectedRequest.amount > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Amount</p>
                        <p className="font-bold text-lg text-primary">₹{selectedRequest.amount}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1 text-primary">Reason</p>
                    <p className="text-sm font-medium leading-relaxed italic text-foreground/80">"{selectedRequest.reason}"</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Admin Remarks (Optional)</label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Enter approval/rejection notes here..."
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.requestId, 'Rejected')}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> REJECT
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.requestId, 'Approved')}
                  className="bg-green-500 text-white hover:bg-green-600 py-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle className="w-5 h-5" /> APPROVE
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  </DashboardLayout>
  );
};

export default PersonalRequests;
