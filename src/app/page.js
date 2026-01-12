"use client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import TodoApp from "@/components/TodoApp";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState("login"); // login, register, guest, app

  // Show loading state
  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  // User is logged in
  if (user) {
    return <TodoApp onLogout={logout} />;
  }

  // Guest mode
  if (view === "guest") {
    return <TodoApp onLogout={() => setView("login")} />;
  }

  // Auth screens
  if (view === "register") {
    return (
      <RegisterForm
        onSwitch={(v) => setView(v)}
      />
    );
  }

  return (
    <LoginForm
      onSwitch={(v) => setView(v)}
    />
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}