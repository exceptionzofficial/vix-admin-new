import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { IndianRupee, Download, Users, TrendingUp, Calendar, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

type PayrollRecord = {
  id: number;
  employee: string;
  avatar: string;
  department: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "Paid" | "Processing" | "Pending";
  paidDate: string;
};

const payrollData: PayrollRecord[] = [
  { id: 1, employee: "Ravi Kumar", avatar: "RK", department: "Marketing", baseSalary: 35000, bonus: 5000, deductions: 4200, netPay: 35800, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 2, employee: "Priya Sharma", avatar: "PS", department: "Events", baseSalary: 42000, bonus: 8000, deductions: 5040, netPay: 44960, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 3, employee: "Arun Mohan", avatar: "AM", department: "Operations", baseSalary: 38000, bonus: 3000, deductions: 4560, netPay: 36440, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 4, employee: "Divya Raj", avatar: "DR", department: "Sales", baseSalary: 30000, bonus: 7500, deductions: 3600, netPay: 33900, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 5, employee: "Karthik V", avatar: "KV", department: "Marketing", baseSalary: 28000, bonus: 2000, deductions: 3360, netPay: 26640, status: "Processing", paidDate: "—" },
  { id: 6, employee: "Sneha B", avatar: "SB", department: "Design", baseSalary: 45000, bonus: 6000, deductions: 5400, netPay: 45600, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 7, employee: "Manoj K", avatar: "MK", department: "Logistics", baseSalary: 25000, bonus: 2500, deductions: 3000, netPay: 24500, status: "Pending", paidDate: "—" },
  { id: 8, employee: "Deepa S", avatar: "DS", department: "Operations", baseSalary: 32000, bonus: 4000, deductions: 3840, netPay: 32160, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 9, employee: "Vijay R", avatar: "VR", department: "Sales", baseSalary: 29000, bonus: 3500, deductions: 3480, netPay: 29020, status: "Paid", paidDate: "Mar 1, 2026" },
  { id: 10, employee: "Lakshmi N", avatar: "LN", department: "Events", baseSalary: 36000, bonus: 5500, deductions: 4320, netPay: 37180, status: "Paid", paidDate: "Mar 1, 2026" },
];

const statusColors: Record<string, string> = {
  Paid: "bg-green-500/20 text-green-400",
  Processing: "bg-secondary/20 text-secondary",
  Pending: "bg-accent/20 text-accent",
};

const Payroll = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "manager";
  const [search, setSearch] = useState("");
  const [month] = useState("March 2026");

  const filtered = payrollData.filter(r => r.employee.toLowerCase().includes(search.toLowerCase()));
  const totalPayout = payrollData.reduce((s, r) => s + r.netPay, 0);
  const totalBonus = payrollData.reduce((s, r) => s + r.bonus, 0);

  const downloadPayslip = (record: PayrollRecord) => {
    const doc = new jsPDF();
    doc.setFillColor(255, 193, 7);
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(255, 0, 80);
    doc.rect(0, 4, 210, 1, "F");

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 193, 7);
    doc.text("CRAYONZ", 15, 20);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Entertainment Pvt Ltd · Payslip", 15, 25);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`PAYSLIP - ${month}`, 15, 40);

    doc.setFontSize(10);
    doc.text(`Employee: ${record.employee}`, 15, 52);
    doc.text(`Department: ${record.department}`, 15, 58);
    doc.text(`ID: EMP${String(record.id).padStart(3, "0")}`, 15, 64);

    doc.autoTable({
      startY: 72,
      head: [["Component", "Amount (₹)"]],
      body: [
        ["Base Salary", record.baseSalary.toLocaleString("en-IN")],
        ["Bonus / Incentive", record.bonus.toLocaleString("en-IN")],
        ["Deductions (PF, ESI, Tax)", `- ${record.deductions.toLocaleString("en-IN")}`],
        ["Net Pay", record.netPay.toLocaleString("en-IN")],
      ],
      headStyles: { fillColor: [255, 193, 7], textColor: [15, 15, 15], fontStyle: "bold" },
      bodyStyles: { textColor: [60, 60, 60] },
      margin: { left: 15, right: 15 },
    });

    const pageH = doc.internal.pageSize.height;
    doc.setFillColor(255, 0, 80);
    doc.rect(0, pageH - 5, 210, 1, "F");
    doc.setFillColor(255, 193, 7);
    doc.rect(0, pageH - 4, 210, 4, "F");

    doc.save(`Payslip_${record.employee.replace(" ", "_")}_${month.replace(" ", "_")}.pdf`);
    toast.success(`Payslip downloaded for ${record.employee}`);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Payroll</h1>
            <p className="text-muted-foreground text-sm">{month} · {payrollData.length} employees</p>
          </div>
        </div>

        {/* Stats */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Payout", value: `₹${totalPayout.toLocaleString("en-IN")}`, icon: IndianRupee, sub: `${payrollData.length} employees` },
              { label: "Total Bonuses", value: `₹${totalBonus.toLocaleString("en-IN")}`, icon: TrendingUp, sub: "Incentives & bonuses" },
              { label: "Pay Cycle", value: month, icon: Calendar, sub: "Next: Apr 1, 2026" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10"><s.icon className="w-5 h-5 text-primary" /></div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-2xl font-montserrat font-bold gradient-text">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search */}
        {isAdmin && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        )}

        {/* Payroll Table */}
        <div className="space-y-2">
          {(isAdmin ? filtered : payrollData.slice(0, 1)).map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card-hover p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{r.employee}</h3>
                <p className="text-xs text-muted-foreground">{r.department}</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-xs text-muted-foreground">Base</p>
                <p className="text-sm">₹{r.baseSalary.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-xs text-muted-foreground">Bonus</p>
                <p className="text-sm text-green-400">+₹{r.bonus.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-center hidden lg:block">
                <p className="text-xs text-muted-foreground">Deductions</p>
                <p className="text-sm text-accent">-₹{r.deductions.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Net Pay</p>
                <p className="text-sm font-bold gradient-text">₹{r.netPay.toLocaleString("en-IN")}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
              <button onClick={() => downloadPayslip(r)} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all" title="Download Payslip">
                <Download className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Payroll;
