import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "manager" | "employee" | "vendor";

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string;
}

interface AuthContextType extends AuthState {
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};

const roleNames: Record<UserRole, string> = {
  admin: "Super Admin",
  manager: "Manager",
  employee: "Employee",
  vendor: "Vendor Partner",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: "admin",
    userName: "",
  });

  const login = (role: UserRole) => {
    setAuth({ isAuthenticated: true, role, userName: roleNames[role] });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: "admin", userName: "" });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
