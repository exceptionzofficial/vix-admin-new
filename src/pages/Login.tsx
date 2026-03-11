import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import crayonzLogo from "@/assets/crayonz-logo.png";

const roles = [
  { label: "Super Admin", value: "admin" as UserRole },
  { label: "Manager", value: "manager" as UserRole },
  { label: "Employee", value: "employee" as UserRole },
  { label: "Vendor", value: "vendor" as UserRole },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSplash(true);
      setTimeout(() => {
        login(role);
        // Employee role goes to mobile portal
        if (role === "employee") {
          navigate("/employee-portal");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex items-center justify-center flex-col"
          >
            <motion.img
              src={crayonzLogo}
              alt="Crayonz Logo"
              className="w-40 h-40 object-contain"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm mt-4"
            >
              Loading {roles.find(r => r.value === role)?.label} Portal...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ delay: 0.3, duration: 1.5 }}
              className="h-1 rounded-full mt-4"
              style={{ background: "var(--gradient-primary)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ background: "var(--gradient-primary)", filter: "blur(100px)", top: "-10%", left: "-10%" }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-15"
          style={{ background: "var(--gradient-accent)", filter: "blur(100px)", bottom: "-10%", right: "-10%" }}
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8 w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.img
            src={crayonzLogo}
            alt="Crayonz Entertainment"
            className="w-24 h-24 mx-auto object-contain mb-2"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="text-muted-foreground text-sm">Entertainment Super CRM</p>
        </motion.div>

        {/* Role Selector */}
        {/* Role Selector commented out as per user request to default to Super Admin
        <div className="grid grid-cols-4 gap-2 mb-6">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                role === r.value
                  ? "btn-gradient shadow-lg"
                  : "glass-card hover:bg-card/70 text-muted-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        */}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@crayonz.com"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-muted-foreground mb-1 block">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 btn-gradient rounded-xl text-base disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {isLoading ? (
              <motion.span
                className="inline-block"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Demo: Enter any credentials to explore
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
