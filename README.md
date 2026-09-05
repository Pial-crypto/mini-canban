# Mini Kanban Board

A collaborative Kanban board application: users register, create boards, share them with
other registered users, and organize work into columns and drag-and-drop tasks.

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS, drag-and-drop via
  [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd).
- **Backend**: NestJS + TypeScript, JWT authentication, Prisma ORM.
- **Database**: PostgreSQL.
- **DevOps**: Docker + Docker Compose for one-command local setup.

---

## 1. Architecture overview

```
mini-kanban/
├── backend/     NestJS API (auth, boards, columns, tasks)
├── frontend/    Next.js app (login/register, board list, Kanban board view)
└── docker-compose.yml
```

### Data model

```
User ──< BoardMember >── Board ──< Column ──< Task
                            │
                          owner (User)
```

- **User** — registered account (email/password, hashed with bcrypt).
- **Board** — has one `owner` (a User) and any number of `BoardMember` rows granting other
  users `EDITOR` or `VIEWER` access.
- **BoardMember** — join table between `User` and `Board` carrying a `role`
  (`OWNER` is implicit via `Board.ownerId`; explicit shared roles are `EDITOR` / `VIEWER`).
- **Column** — belongs to a board, has a `title` and a `position`.
- **Task** — belongs to a column, has a `title`, optional `description`, and a `position`.

### Access control

Every board/column/task mutation goes through a single `BoardAccessService`
(`backend/src/common/board-access.service.ts`) that resolves a user's effective role on a
board (owner, or via `BoardMember`) and enforces a minimum role:

| Action                                   | Minimum role |
|-------------------------------------------|--------------|
| View board / columns / tasks              | `VIEWER`     |
| Create / edit / delete columns and tasks  | `EDITOR`     |
| Reorder / move tasks and columns          | `EDITOR`     |
| Rename/describe board                     | `EDITOR`     |
| Delete board, share board, manage members | `OWNER`      |

Requests for boards a user has no access to return `404` (not `403`) so board IDs can't be
enumerated. Columns/tasks resolve their parent board internally, so a user can never mutate
a column or task that doesn't belong to a board they have access to.

### Task ordering (drag-and-drop) design

Rather than storing dense integer indices (which would require rewriting every sibling row
on every reorder — a classic source of race conditions when two people drag at once), each
`Column` and `Task` stores a floating point `position`. Moving an item only writes to the
moved row: the new position is computed as the midpoint between its new neighbors'
positions (`backend/src/common/position.service.ts`). This keeps reordering O(1) writes and
free of conflicts under concurrent drag operations.

The single endpoint `PATCH /api/tasks/:id/move` with body `{ targetColumnId, targetIndex }`
handles **both** same-column reordering and cross-column moves — the frontend always sends
the destination column and the desired zero-based index within it. The whole
read-compute-write happens inside a Prisma transaction. The service also verifies the
destination column belongs to the same board as the source task, so a task can't be
dragged into a column on a board the user doesn't have access to.

Columns themselves are reorderable the same way via `PATCH /api/columns/:id/reorder`.

---

## 2. Prerequisites

- **Docker & Docker Compose** (recommended — see [Quick start](#3-quick-start-docker)), **or**
- Node.js 20+, npm, and a local PostgreSQL 14+ instance if running without Docker.

---

## 3. Quick start (Docker)

This spins up Postgres, the NestJS API, and the Next.js frontend with one command.

```bash
git clone <this-repo-url> mini-kanban
cd mini-kanban

# optional: copy and edit env overrides used by docker-compose.yml
cp backend/.env.example backend/.env   # not required for docker-compose itself, see note below
cp frontend/.env.example frontend/.env # not required for docker-compose itself, see note below

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Postgres: localhost:5432 (user/pass/db: `kanban` / `kanban` / `kanban`)

`docker-compose.yml` already sets sane defaults for `DATABASE_URL`, `JWT_SECRET`,
`CORS_ORIGIN`, and `NEXT_PUBLIC_API_URL` so `docker compose up --build` works out of the
box. To override any of them (e.g. a real `JWT_SECRET`), export the variable before running
compose, or create a `.env` file **next to `docker-compose.yml`** — Compose auto-loads it:

```bash
# .env (next to docker-compose.yml)
JWT_SECRET=some-long-random-string
NEXT_PUBLIC_API_URL=http://localhost:4000/api
CORS_ORIGIN=http://localhost:3000
```

On first boot, the backend container automatically runs `prisma migrate deploy` to create
the schema before starting the server.

---

## 4. Running locally without Docker

### 4.1 Database

Create a Postgres database and note its connection string, e.g.:

```
postgresql://kanban:kanban@localhost:5432/kanban?schema=public
```

### 4.2 Backend

```bash
cd backend
cp .env.example .env    # edit DATABASE_URL / JWT_SECRET as needed
npm install
npx prisma migrate deploy   # applies the committed migration
npm run start:dev           # http://localhost:4000/api
```

Sample `backend/.env`:

```env
DATABASE_URL="postgresql://kanban:kanban@localhost:5432/kanban?schema=public"
JWT_SECRET="change-this-to-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### 4.3 Frontend

In a separate terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev   # http://localhost:3000
```

Sample `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## 5. Using the app

1. Register two (or more) accounts — one to be the board owner, another to be invited.
2. As the owner, create a board from **Your boards**.
3. Open the board, add a few columns (e.g. *To Do*, *In Progress*, *Done*) and some tasks.
4. Drag tasks between columns, and drag columns to reorder them.
5. Click **Share**, invite the second account's email as `Editor` or `Viewer`.
6. Log in as the second account — the board now appears in their list with the role you
   assigned. A `Viewer` can see the board but cannot add, edit, delete, or drag anything.

---

## 6. API summary

All routes are prefixed with `/api` and (except register/login) require
`Authorization: Bearer <token>`.

| Method | Path                                  | Description                                  |
|--------|----------------------------------------|-----------------------------------------------|
| POST   | `/auth/register`                       | Create an account, returns a JWT             |
| POST   | `/auth/login`                          | Authenticate, returns a JWT                  |
| GET    | `/auth/me`                             | Current user profile                         |
| GET    | `/boards`                              | Boards you own or are a member of            |
| POST   | `/boards`                              | Create a board                               |
| GET    | `/boards/:id`                          | Board with columns + tasks                   |
| PATCH  | `/boards/:id`                          | Rename / update description (owner/editor)   |
| DELETE | `/boards/:id`                          | Delete board (owner only)                    |
| POST   | `/boards/:id/share`                    | Invite a registered user by email (owner)    |
| PATCH  | `/boards/:id/members/:userId`          | Change a member's role (owner)               |
| DELETE | `/boards/:id/members/:userId`          | Remove a member (owner)                      |
| POST   | `/columns`                             | Create a column                              |
| PATCH  | `/columns/:id`                         | Rename a column                              |
| DELETE | `/columns/:id`                         | Delete a column (and its tasks)              |
| PATCH  | `/columns/:id/reorder`                 | Move a column to `targetIndex`               |
| POST   | `/tasks`                               | Create a task                                |
| PATCH  | `/tasks/:id`                           | Edit a task's title/description              |
| DELETE | `/tasks/:id`                           | Delete a task                                |
| PATCH  | `/tasks/:id/move`                      | Move/reorder — `{ targetColumnId, targetIndex }` |

---

## 7. Project structure

```
backend/
  prisma/schema.prisma       Data model
  prisma/migrations/         Committed SQL migration
  src/auth/                  Registration, login, JWT strategy/guard
  src/boards/                Board CRUD + sharing
  src/columns/                Column CRUD + reorder
  src/tasks/                  Task CRUD + move (drag-and-drop) endpoint
  src/common/                 BoardAccessService (authZ), PositionService (fractional ordering)

frontend/
  src/app/login, /register    Auth pages
  src/app/boards              Board list + create
  src/app/boards/[id]         Kanban board view (drag-and-drop)
  src/components/             BoardColumn, TaskCard, ShareModal, Navbar, ProtectedRoute
  src/hooks/useAuth.tsx       Auth context (JWT stored in localStorage)
  src/lib/api.ts              Typed fetch client for the backend API
```

---

## 8. Notes / possible follow-ups

- **Pagination:** The current implementation loads the available boards in a simple way. As the number of boards and users grows, **server-side pagination** will be introduced so that only the required records are fetched per page.

- **Search and filtering:** As datasets grow, **search and filtering** will be added for boards, columns, tasks, and members to keep the UI efficient and easy to navigate.

- **Database indexing:** **Additional database indexes** will be introduced on frequently queried fields as the dataset grows to maintain query performance.

- **Query optimization:** Prisma queries and relation loading will be **optimized and reduced to only the required fields** when larger datasets make unnecessary data fetching expensive.

- **Caching:** **Caching** can be introduced for frequently accessed data when database traffic increases.

- **Lazy loading:** Large datasets and resource-heavy sections can use **lazy loading or incremental loading** to reduce the initial amount of data transferred to the client.

- **API optimization:** **API responses will be optimized** as the application scales to avoid transferring unnecessary data between the frontend and backend.

- **Rate limiting:** **API rate limiting and request optimization** was introduced to protect the backend and maintain stable performance under higher traffic.

- **Background processing:** Expensive non-blocking operations can be moved to **background jobs** as the application grows.

- **Horizontal scaling:** If traffic eventually exceeds the capacity of a single backend instance, the backend can be **scaled horizontally** behind a load balancer.

- **Monitoring:** **Application, database, and API performance monitoring** can be added to identify bottlenecks and guide further optimization.

- **Authentication hardening:** Tokens are currently stored in `localStorage` for simplicity; an **httpOnly-cookie-based session** would be a more hardened choice for production.

- **Position maintenance:** The move/reorder endpoints use fractional positions; an optional periodic **position renormalization job** could reset positions to clean integers if a column saw an extreme number of inserts at the exact same spot.

- **Real-time synchronization:** There is currently no live/websocket sync between simultaneous viewers. **WebSocket-based real-time synchronization** can be introduced when collaborative live updates become necessary.

- **Deployment:** Fully deployed and available online. The frontend is hosted on Vercel and the backend/API is hosted on Railway with live Swagger API documentation. See the links below:

  - **Frontend:** https://mini-canban.vercel.app/
  - **Backend API / Swagger:** https://mini-canban-production.up.railway.app/api/docs

  The `frontend`/`backend` Dockerfiles are also production-ready (`next build`/`nest build`) and can be used to deploy the application to other container hosts with a managed PostgreSQL instance.
