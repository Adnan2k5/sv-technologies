import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("sv_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("sv_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.getMe()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("sv_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("sv_token");
        localStorage.removeItem("sv_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem("sv_token", data.token);
    localStorage.setItem("sv_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    localStorage.setItem("sv_token", data.token);
    localStorage.setItem("sv_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sv_token");
    localStorage.removeItem("sv_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await authApi.getMe();
    setUser(data.user);
    localStorage.setItem("sv_user", JSON.stringify(data.user));
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
