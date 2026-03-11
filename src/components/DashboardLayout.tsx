import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 glass-card border-b border-border/50">
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-muted/50 transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-montserrat font-bold gradient-text">CRAYONZ</span>
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-background border-border/50">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[240px] p-6 transition-all duration-300">{children}</main>
    </div>
  );
};

export default DashboardLayout;
