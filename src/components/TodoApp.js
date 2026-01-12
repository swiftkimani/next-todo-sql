"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addTodoAction,
  getTodosAction,
  toggleTodoAction,
  deleteTodoAction,
} from "@/app/actions";
import TodoItem from "./TodoItem";
import GuestBanner from "./GuestBanner";

export default function TodoApp({ onLogout }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Load todos on mount
  useEffect(() => {
    async function loadTodos() {
      if (user) {
        // Logged in: fetch from database
        const serverTodos = await getTodosAction();
        setTodos(serverTodos);
      } else {
        // Guest: load from localStorage
        const guestTodos = JSON.parse(localStorage.getItem("guest_todos") || "[]");
        setTodos(guestTodos);
      }
      setLoading(false);
    }
    loadTodos();
  }, [user]);

  // Save guest todos to localStorage
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("guest_todos", JSON.stringify(todos));
    }
  }, [todos, user, loading]);

  async function handleAddTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    if (user) {
      // Logged in: save to database
      const todo = await addTodoAction(newTodo.trim());
      setTodos((prev) => [todo, ...prev]);
    } else {
      // Guest: save to localStorage
      const todo = {
        id: `guest_${Date.now()}`,
        title: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [todo, ...prev]);
    }
    setNewTodo("");
  }

  async function handleToggle(id, completed) {
    if (user) {
      await toggleTodoAction(id, completed);
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      )
    );
  }

  async function handleDelete(id) {
    if (user) {
      await deleteTodoAction(id);
    }
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app-container">
      <header className="glass-card app-header">
        <h1 className="app-logo">✨ TaskFlow</h1>
        <div className="app-user">
          {user ? (
            <>
              <span className="app-user-email">{user.email}</span>
              <button className="btn btn-ghost" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={onLogout}>
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="glass-card app-main">
        {!user && <GuestBanner onSignIn={onLogout} />}

        <form onSubmit={handleAddTodo} className="add-todo-container">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="add-todo-input"
          />
          <button type="submit" className="add-todo-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
          </button>
        </form>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({todos.length})
          </button>
          <button
            className={`filter-tab ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active ({activeCount})
          </button>
          <button
            className={`filter-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Done ({completedCount})
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: "0 auto" }}></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p className="empty-state-text">
              {filter === "all"
                ? "No tasks yet. Add one above!"
                : filter === "active"
                ? "No active tasks. Great job!"
                : "No completed tasks yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
