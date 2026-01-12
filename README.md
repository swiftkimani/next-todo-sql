# ✨ TaskFlow

A modern, elegant task management app built with Next.js 16 and PostgreSQL via Prisma.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

## Features

- **User Authentication** – Register and sign in to sync your tasks across devices
- **Guest Mode** – Try the app without creating an account (tasks saved locally)
- **Persistent Storage** – PostgreSQL database for registered users via Prisma ORM
- **Task Filtering** – View all tasks, active tasks, or completed tasks
- **Glassmorphism UI** – Beautiful, modern design with smooth animations

## Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| Framework | Next.js 16 (App Router)         |
| Frontend  | React 19                        |
| Database  | PostgreSQL                      |
| ORM       | Prisma 6                        |
| Styling   | Custom CSS with Tailwind        |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd next-todo-sql
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@host:5432/database"
   ```

4. **Push database schema**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API actions
├── components/       # React components
│   ├── TodoApp.js    # Main todo application
│   ├── TodoItem.js   # Individual todo item
│   ├── LoginForm.js  # User login
│   ├── RegisterForm.js # User registration
│   └── GuestBanner.js  # Guest mode notification
├── context/          # React context (Auth)
└── lib/              # Utility libraries
prisma/
└── schema.prisma     # Database schema
```

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start development server |
| `npm run build`  | Build for production     |
| `npm run start`  | Start production server  |
| `npm run lint`   | Run ESLint               |

## Database Schema

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## License

MIT
