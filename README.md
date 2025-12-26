# Workflow Runner

A robust, real-time workflow automation engine built with **Laravel 12**, **React (Inertia.js)**, and **Tailwind CSS**. Define multi-step processes, execute them with live status tracking, and review detailed execution logs.

## 🚀 Key Features

- **Workflow Builder**: Create and manage custom workflows.
- **Dynamic Steps**: 
  - **Delay**: Pause execution for a set duration.
  - **HTTP Check**: Validate endpoint reachability in real-time.
- **Drag-and-Drop Reordering**: Rearrange steps easily.
- **Real-Time Execution**: Watch workflows run with in-place animations on the detail page or a focused modal on the dashboard.
- **Detailed Run Logs**: Review every step's outcome with a clean, human-readable execution timeline.

## 🛠️ Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18, Inertia.js (SSR Ready)
- **Styling**: Tailwind CSS, Shadcn UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## ⚙️ Installation & Setup

1. **Clone the repository** (if applicable) and enter the directory.
2. **Install PHP Dependencies**:
   ```bash
   composer install
   ```
3. **Install JS Dependencies**:
   ```bash
   npm install
   ```
4. **Environment Setup**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. **Database Initialization**:
   ```bash
   # Configured for SQLite by default
   touch database/database.sqlite
   php artisan migrate --seed
   ```
6. **Start the Servers**:
   ```bash
   # Terminal 1: Vite Dev Server
   npm run dev

   # Terminal 2: Laravel Server
   php artisan serve
   ```

## 🧪 Testing

The project includes feature tests for workflows, steps, and run logic.

```bash
php artisan test
```

---

## 🤖 AI Appendix: The Development Process

This project was built using an **Agentic AI Pairing** approach. Below is a summary of the collaborative process between the "Antigravity" AI agent and the developer.

### 🧠 Architectural Philosophy
The core goal was to build an interactive experience that didn't sacrifice standard Laravel/Inertia best practices. 
- **Service-Oriented**: Execution logic is encapsulated in `WorkflowRunnerService.php` for testability.
- **Frontend-Driven Status**: Real-time feedback is managed by the `useWorkflowRunner` custom hook, providing a consistent state across different UI entry points (Index vs. Show).

### 🔄 Project Evolution & Pivot Points
During development, several key design decisions were made based on test:
1. **Modal vs. Inline**: Originally, all executions used a modal. We transitioned the **Show Page** to use **In-Place Animations** on the steps themselves, while keeping the modal for the **Index Page** for quick actions.
2. **Session State Fix**: A critical navigation bug ("Could not navigate to results") was solved by correctly sharing flashed session data (run IDs) via the `HandleInertiaRequests` middleware.

### 🛠️ Collaboration Patterns
- **Iterative Refinement**: Code was written in small, verifiable chunks, often followed by running `php artisan migrate:fresh --seed` and feature tests to ensure zero regressions.
- **UX Tuning**: Small details, such as making timestamps human-readable (Intl.DateTimeFormat) and adding "delete" confirmation text-matching, were added to avoid accidental deletion.