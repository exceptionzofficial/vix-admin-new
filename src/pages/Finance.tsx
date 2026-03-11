import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { FileText, Plus, Download, X, IndianRupee, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

type LineItem = { description: string; qty: number; rate: number };
type DocType = "invoice" | "quotation";

const sampleBilling = [
  { id: 1, client: "TCS", event: "Tech Expo 2026", amount: 250000, status: "Paid", date: "Mar 1, 2026" },
  { id: 2, client: "Wipro", event: "Annual Day", amount: 180000, status: "Pending", date: "Mar 3, 2026" },
  { id: 3, client: "Zoho", event: "Product Launch", amount: 320000, status: "Paid", date: "Feb 28, 2026" },
  { id: 4, client: "Freshworks", event: "Hackathon", amount: 95000, status: "Pending", date: "Mar 5, 2026" },
  { id: 5, client: "HCL", event: "Leadership Summit", amount: 450000, status: "Paid", date: "Feb 25, 2026" },
];

const emptyItem = (): LineItem => ({ description: "", qty: 1, rate: 0 });

const Finance = () => {
  const [tab, setTab] = useState<"billing" | "invoice" | "quotation">("billing");
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState<DocType>("invoice");
  const [client, setClient] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [logoData, setLogoData] = useState<string | null>(null);

  const total = items.reduce((s, i) => s + i.qty * i.rate, 0);

  // Pre-load logo as base64 for PDF embedding
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setLogoData(canvas.toDataURL("image/jpeg", 0.9));
      }
    };
    img.src = "/crayonz-logo.jpeg";
  }, []);

  const resetForm = () => {
    setClient("");
    setItems([emptyItem()]);
    setNotes("");
    setShowModal(false);
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, val: string | number) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const generatePDF = (type: DocType, clientName: string, lineItems: LineItem[], noteText: string) => {
    const doc = new jsPDF();
    const title = type === "invoice" ? "INVOICE" : "QUOTATION";
    const docNum = `${type === "invoice" ? "INV" : "QT"}-${Date.now().toString().slice(-6)}`;

    // Header gradient bar
    doc.setFillColor(255, 193, 7);
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(255, 0, 80);
    doc.rect(0, 4, 210, 1, "F");

    // Logo
    if (logoData) {
      doc.addImage(logoData, "JPEG", 15, 8, 25, 25);
    }

    // Company info (shifted right if logo present)
    const textX = logoData ? 45 : 15;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 193, 7);
    doc.text("CRAYONZ", textX, 18);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Entertainment Pvt Ltd", textX, 23);
    doc.text("Perumanallur, Coimbatore, Tamil Nadu", textX, 27);
    doc.text("GSTIN: 33AABCC1234F1Z5", textX, 31);

    // Doc type & number
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(title, 195, 18, { align: "right" });
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`${docNum}`, 195, 24, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 195, 29, { align: "right" });

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(15, 38, 195, 38);

    // Bill To
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("BILL TO", 15, 46);
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text(clientName || "Client Name", 15, 52);

    // Table
    const tableData = lineItems
      .filter(i => i.description)
      .map((item, idx) => [
        idx + 1,
        item.description,
        item.qty,
        `₹${item.rate.toLocaleString("en-IN")}`,
        `₹${(item.qty * item.rate).toLocaleString("en-IN")}`,
      ]);

    doc.autoTable({
      startY: 60,
      head: [["#", "Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [255, 193, 7], textColor: [15, 15, 15], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [250, 250, 245] },
      columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 18, halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" } },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Total
    const totalAmt = lineItems.reduce((s, i) => s + i.qty * i.rate, 0);
    doc.setFillColor(245, 245, 240);
    doc.rect(120, finalY, 75, 24, "F");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Subtotal:", 125, finalY + 8);
    doc.text(`₹${totalAmt.toLocaleString("en-IN")}`, 190, finalY + 8, { align: "right" });
    doc.text("GST (18%):", 125, finalY + 14);
    doc.text(`₹${Math.round(totalAmt * 0.18).toLocaleString("en-IN")}`, 190, finalY + 14, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.text("Total:", 125, finalY + 22);
    doc.text(`₹${Math.round(totalAmt * 1.18).toLocaleString("en-IN")}`, 190, finalY + 22, { align: "right" });

    // Notes
    if (noteText) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140, 140, 140);
      doc.text("Notes:", 15, finalY + 6);
      doc.text(noteText, 15, finalY + 11, { maxWidth: 90 });
    }

    // Footer
    const pageH = doc.internal.pageSize.height;
    doc.setFillColor(255, 0, 80);
    doc.rect(0, pageH - 5, 210, 1, "F");
    doc.setFillColor(255, 193, 7);
    doc.rect(0, pageH - 4, 210, 4, "F");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business! | crayonz.in | +91 98765 43210", 105, pageH - 8, { align: "center" });

    doc.save(`${title}_${docNum}.pdf`);
    toast.success(`${title} ${docNum} downloaded!`);
  };

  const handleSubmit = () => {
    if (!client) return toast.error("Enter client name");
    if (items.every(i => !i.description)) return toast.error("Add at least one line item");
    generatePDF(docType, client, items, notes);
    resetForm();
  };

  const handleQuickDownload = (billing: typeof sampleBilling[0], type: DocType) => {
    const lineItems: LineItem[] = [
      { description: `Event Management - ${billing.event}`, qty: 1, rate: Math.round(billing.amount * 0.6) },
      { description: "Venue & Logistics", qty: 1, rate: Math.round(billing.amount * 0.25) },
      { description: "Technical & Support", qty: 1, rate: Math.round(billing.amount * 0.15) },
    ];
    generatePDF(type, billing.client, lineItems, `Event: ${billing.event}`);
  };

  const openModal = (type: DocType) => {
    setDocType(type);
    setShowModal(true);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-montserrat font-bold">Finance & Billing</h1>
            <p className="text-muted-foreground text-sm">Manage invoices, quotations & billing</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openModal("invoice")} className="btn-gradient px-4 py-2.5 flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Invoice
            </button>
            <button onClick={() => openModal("quotation")} className="px-4 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-2 text-sm transition-all">
              <FileText className="w-4 h-4" /> New Quotation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Billing", value: "₹12,95,000", sub: "5 transactions" },
            { label: "Pending Payouts", value: "₹2,75,000", sub: "2 pending" },
            { label: "Avg Event Margin", value: "32%", sub: "+4% this month" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-5">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-montserrat font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["billing", "invoice", "quotation"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted/50"}`}>
              {t === "billing" ? "Billing History" : t === "invoice" ? "Invoices" : "Quotations"}
            </button>
          ))}
        </div>

        {/* Billing Table */}
        <div className="space-y-3">
          {sampleBilling.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-4 flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{b.event}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{b.client} · {b.date}</p>
              </div>
              <span className="font-montserrat font-bold gradient-text">₹{b.amount.toLocaleString("en-IN")}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.status === "Paid" ? "bg-green-500/20 text-green-400" : "bg-secondary/20 text-secondary"}`}>
                {b.status}
              </span>
              <div className="flex gap-1">
                <button onClick={() => handleQuickDownload(b, "invoice")} title="Download Invoice"
                  className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                  <Receipt className="w-4 h-4" />
                </button>
                <button onClick={() => handleQuickDownload(b, "quotation")} title="Download Quotation"
                  className="p-2 rounded-lg hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-all">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create Invoice / Quotation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-bold">
                  {docType === "invoice" ? "Create Invoice" : "Prepare Quotation"}
                </h2>
                <button onClick={() => resetForm()} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Client / Company Name</label>
                  <input value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. TCS, Zoho Corp" className={inputClass} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Line Items</label>
                    <button onClick={addItem} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">
                        <input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)}
                          placeholder="Service description" className={inputClass} />
                        <input type="number" value={item.qty || ""} onChange={e => updateItem(idx, "qty", Number(e.target.value))}
                          placeholder="Qty" className={inputClass} min={1} />
                        <input type="number" value={item.rate || ""} onChange={e => updateItem(idx, "rate", Number(e.target.value))}
                          placeholder="Rate ₹" className={inputClass} />
                        {items.length > 1 && (
                          <button onClick={() => removeItem(idx)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="text-sm">₹{total.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GST (18%)</p>
                    <p className="text-sm">₹{Math.round(total * 0.18).toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Grand Total</p>
                    <p className="text-lg font-montserrat font-bold gradient-text">₹{Math.round(total * 1.18).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Notes / Terms</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder="Payment terms, special instructions..."
                    className={`${inputClass} resize-none`} />
                </div>

                <button onClick={handleSubmit}
                  className="w-full py-3 btn-gradient rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Generate & Download {docType === "invoice" ? "Invoice" : "Quotation"} PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Finance;
