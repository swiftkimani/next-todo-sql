"use server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

// ============================================================================
// Password Hashing
// ============================================================================

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ============================================================================
// Session Management
// ============================================================================

const SESSION_COOKIE_NAME = "todo_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function createSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  
  // Store session token with user ID (in production, use a session table)
  cookieStore.set(SESSION_COOKIE_NAME, `${userId}:${sessionToken}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  
  return sessionToken;
}

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!session?.value) return null;
    
    const [userId] = session.value.split(":");
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, email: true, createdAt: true },
    });
    
    return user;
  } catch {
    return null;
  }
}

// ============================================================================
// Auth Actions
// ============================================================================

export async function registerUserAction(email, password) {
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true },
    });

    await createSession(user.id);
    return { user };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
}

export async function loginUserAction(email, password) {
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return { error: "Invalid email or password" };
    }

    await createSession(user.id);
    return { user: { id: user.id, email: user.email } };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to log in" };
  }
}

export async function logoutUserAction() {
  await clearSession();
  return { success: true };
}

// ============================================================================
// Todo Actions
// ============================================================================

export async function addTodoAction(title, isGuest = false) {
  const user = await getCurrentUser();
  
  const todo = await prisma.todo.create({
    data: {
      title,
      userId: user?.id || null,
    },
  });
  
  return todo;
}

export async function getTodosAction() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return empty for server - client handles localStorage
    return [];
  }
  
  return await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleTodoAction(id, completed) {
  const user = await getCurrentUser();
  
  // Verify ownership
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || (user && todo.userId !== user.id)) {
    return { error: "Todo not found" };
  }
  
  return await prisma.todo.update({
    where: { id },
    data: { completed: !completed },
  });
}

export async function deleteTodoAction(id) {
  const user = await getCurrentUser();
  
  // Verify ownership
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || (user && todo.userId !== user.id)) {
    return { error: "Todo not found" };
  }
  
  await prisma.todo.delete({ where: { id } });
  return { success: true };
}

export async function syncGuestTodosAction(guestTodos) {
  const user = await getCurrentUser();
  
  if (!user || !guestTodos?.length) {
    return { synced: 0 };
  }
  
  // Create all guest todos for this user
  const created = await prisma.todo.createMany({
    data: guestTodos.map((todo) => ({
      title: todo.title,
      completed: todo.completed || false,
      userId: user.id,
    })),
  });
  
  return { synced: created.count };
}

// Legacy exports for compatibility
export async function getTodos() {
  return getTodosAction();
}

export async function createUserAction(email, password) {
  return registerUserAction(email, password);
}