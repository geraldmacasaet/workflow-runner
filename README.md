# Workflow Runner

A robust, real-time workflow automation engine built with **Laravel 12**, **React (Inertia.js)**, and **Tailwind CSS**. Define multi-step processes, execute them with live status tracking, and review detailed execution logs.

## Key Features

- **Workflow Builder**: Create and manage custom workflows.
- **Dynamic Steps**: 
  - **Delay**: Pause execution for a set duration.
  - **HTTP Check**: Validate endpoint reachability in real-time.
- **Drag-and-Drop Reordering**: Rearrange steps easily.
- **Real-Time Execution**: Watch workflows run with in-place animations on the detail page or a focused modal on the dashboard.
- **Detailed Run Logs**: Review every step's outcome with a clean, human-readable execution timeline.

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18, Inertia.js (SSR Ready)
- **Styling**: Tailwind CSS, Shadcn UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## Installation & Setup

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

## Registration & Authentication

The application uses **Laravel Fortify** for secure authentication.
- **Sign Up**: Navigate to `/register` to create a new account.
- **Basic Fields**: Registration requires only **Name**, **Email**, and **Password**.
- **Login**: Existing users can sign in at `/login`.

## Testing

The project includes feature tests for workflows, steps, and run logic.

```bash
php artisan test
```

---

## AI Appendix
This project was built using an **Agentic AI Pairing** approach involving **Antigravity** (Gemini-powered agentic AI).

### AI Tools Used
- **Antigravity**: Primary agent for code generation, architectural planning, and debugging.
- **Laravel 12 / React SSR**: Integrated via AI-assisted scaffold generation.

### Architectural Philosophy
The core goal was to build an interactive experience that didn't sacrifice standard Laravel/Inertia best practices. 
- **Service-Oriented**: Execution logic is encapsulated in `WorkflowRunnerService.php` for testability.
- **Frontend-Driven Status**: Real-time feedback is managed by the `useWorkflowRunner` custom hook, providing a consistent state across different UI entry points (Index vs. Show).

### Project Evolution & Pivot Points
1. **Modal vs. Inline**: Originally, all executions used a modal. We transitioned the **Show Page** to use **In-Place Animations** on the steps themselves, while keeping the modal for the **Index Page** for quick actions.
2. **Session State Fix**: A critical navigation bug ("Could not navigate to results") was solved by correctly sharing flashed session data (run IDs) via the `HandleInertiaRequests` middleware.

### High-impact Prompts
1. **Prompt goal**: Real-time State Management
   - **What was asked**: Create a custom React hook to manage workflow execution state using Inertia's partial reloads.
   - **What was received**: `useWorkflowRunner` hook with recursive polling logic.
   - **How it was adjusted**: Added a `processing` state to prevent concurrent runs on the same ID.

2. **Prompt goal**: Service Layer Implementation
   - **What was asked**: Abstract workflow execution into a Laravel Service that handles step logic and logging.
   - **What was received**: `WorkflowRunnerService` with a `run()` method.
   - **How it was adjusted**: Added exception handling to ensure logs are closed even if a step fails.

### Where AI was Wrong
- **The Issue**: The AI initially failed to account for shared session state when redirecting after a workflow run, causing the "Could not navigate to results" error.
- **The Fix**: Detected via manual testing; fixed by manually binding the `run_id` to the session flash data in `HandleInertiaRequests.php`.

### Verification Approach
- **Automated Tests**: Comprehensive feature tests for workflow creation, step reordering, and execution flow (`php artisan test`).
- **Manual Verification**: Visual confirmation of "in-place" animations on the detail page and modal behavior on the dashboard.
- **Linting**: Standard Prettier/ESLint for JS and PSR-12 for PHP.

### Time Breakdown (estimate)
- **Setup/scaffolding**: 15m
- **Backend core**: 45m
- **Frontend core**: 30m
- **Tests & Debugging**: 20m
- **Cleanup/README**: 10m