"use client";
import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  loginUserAction,
  registerUserAction,
  logoutUserAction,
  syncGuestTodosAction,
} from "@/app/actions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const result = await loginUserAction(email, password);
    if (result.user) {
      setUser(result.user);
      // Sync guest todos from localStorage
      const guestTodos = JSON.parse(localStorage.getItem("guest_todos") || "[]");
      if (guestTodos.length > 0) {
        await syncGuestTodosAction(guestTodos);
        localStorage.removeItem("guest_todos");
      }
    }
    return result;
  };

  const register = async (email, password) => {
    const result = await registerUserAction(email, password);
    if (result.user) {
      setUser(result.user);
      // Sync guest todos from localStorage
      const guestTodos = JSON.parse(localStorage.getItem("guest_todos") || "[]");
      if (guestTodos.length > 0) {
        await syncGuestTodosAction(guestTodos);
        localStorage.removeItem("guest_todos");
      }
    }
    return result;
  };

  const logout = async () => {
    await logoutUserAction();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
