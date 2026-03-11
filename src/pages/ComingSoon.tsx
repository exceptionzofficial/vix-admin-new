import { motion } from "framer-motion";
import { Rocket, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8"
        >
          <Rocket className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-montserrat font-black mb-4 gradient-text"
        >
          Coming Soon
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-md mb-8"
        >
          We're hard at work building something amazing here. This feature will be available in the next major update.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </motion.div>

        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-primary rounded-full blur-[120px]" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;
