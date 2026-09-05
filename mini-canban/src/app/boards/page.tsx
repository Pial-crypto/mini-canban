'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { BoardSummary } from '@/types';

function BoardsPageContent() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
console.log("user", user);
  async function loadBoards() {
    setLoading(true);
    try {
      const data = await api.listBoards();
      setBoards(data);
    } catch (err) {
      console.log(err);
      setError(err instanceof ApiError ? err.message : 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.createBoard({ title: title.trim(), description: description.trim() || undefined });
      setTitle('');
      setDescription('');
      await loadBoards();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create board');
    } finally {
      setCreating(false);
    }
  }

return (
  <div className="min-h-screen overflow-hidden bg-[#f8f9fc]">
    <Navbar />

    <main className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-0 top-96 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Workspace
        </div>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Your{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                boards
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-500">
              Bring your projects, tasks, and team together. Everything you
              need to keep work moving forward.
            </p>
          </div>

          {!loading && boards.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur">
                <span className="text-lg font-bold text-slate-900">
                  {boards.length}
                </span>
                <span className="ml-1.5 text-sm text-slate-500">
                  {boards.length === 1 ? 'board' : 'boards'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


      <section className="relative mb-12 overflow-hidden rounded-3xl border border-white bg-white shadow-[0_10px_40px_rgba(79,70,229,0.08)]">

        <div
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500"
          aria-hidden="true"
        />

        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-100/70 blur-2xl" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create a new board
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Start a new workspace and turn your ideas into action.
              </p>
            </div>
          </div>

          <form
            onSubmit={onCreate}
            className="grid gap-4 lg:grid-cols-[1fr_1.4fr_auto]"
          >
            <div>
              <label
                htmlFor="board-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Board title
              </label>

              <input
                id="board-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Product Launch"
                disabled={creating}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="board-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description{' '}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                id="board-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this board for?"
                disabled={creating}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating || !title.trim()}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-indigo-500/25 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 lg:w-auto"
              >
                {creating ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-30"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 transition-transform group-hover:rotate-90"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Create board
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>


      {error && (
        <div
          role="alert"
          className="relative mb-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M12 8V12M12 16H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10.3 3.8L2.8 17C2.2 18.1 3 19.5 4.3 19.5H19.7C21 19.5 21.8 18.1 21.2 17L13.7 3.8C13 2.6 11 2.6 10.3 3.8Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p>{error}</p>
        </div>
      )}

  
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-2 animate-pulse bg-slate-200" />

              <div className="p-6">
                <div className="animate-pulse">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                    <div className="h-6 w-16 rounded-full bg-slate-100" />
                  </div>

                  <div className="mb-3 h-5 w-2/3 rounded bg-slate-200" />

                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-3 w-4/5 rounded bg-slate-100" />
                  </div>

                  <div className="mt-7 flex justify-between border-t border-slate-100 pt-5">
                    <div className="h-3 w-20 rounded bg-slate-100" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : boards.length === 0 ? (

        <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 px-6 py-20 text-center shadow-sm">
          <div
            className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-9 w-9"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M9 4V20M9 9H20"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>

            <div className="mx-auto mt-6 max-w-md">
              <h2 className="text-2xl font-bold text-slate-900">
                Your workspace is empty
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Create your first board above and start organizing your
                projects, tasks, and team collaboration.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>

          <div className="relative mb-6 flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Active workspace
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                All boards
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump back into your projects and keep things moving.
              </p>
            </div>
          </div>


          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board, index) => {
              const isOwner = board.ownerId === user?.id;

              const memberRole =
                board.members.find(
                  (member) => member.userId === user?.id,
                )?.role ?? 'Member';

              const themes = [
                {
                  gradient: 'from-violet-500 to-indigo-600',
                  soft: 'bg-violet-50',
                  icon: 'text-violet-600',
                  badge: 'bg-violet-50 text-violet-700 ring-violet-100',
                  hover: 'group-hover:text-violet-600',
                },
                {
                  gradient: 'from-blue-500 to-cyan-500',
                  soft: 'bg-blue-50',
                  icon: 'text-blue-600',
                  badge: 'bg-blue-50 text-blue-700 ring-blue-100',
                  hover: 'group-hover:text-blue-600',
                },
                {
                  gradient: 'from-emerald-500 to-teal-500',
                  soft: 'bg-emerald-50',
                  icon: 'text-emerald-600',
                  badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
                  hover: 'group-hover:text-emerald-600',
                },
                {
                  gradient: 'from-orange-500 to-amber-500',
                  soft: 'bg-orange-50',
                  icon: 'text-orange-600',
                  badge: 'bg-orange-50 text-orange-700 ring-orange-100',
                  hover: 'group-hover:text-orange-600',
                },
                {
                  gradient: 'from-pink-500 to-rose-500',
                  soft: 'bg-pink-50',
                  icon: 'text-pink-600',
                  badge: 'bg-pink-50 text-pink-700 ring-pink-100',
                  hover: 'group-hover:text-pink-600',
                },
                {
                  gradient: 'from-cyan-500 to-sky-500',
                  soft: 'bg-cyan-50',
                  icon: 'text-cyan-600',
                  badge: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
                  hover: 'group-hover:text-cyan-600',
                },
              ];

              const theme = themes[index % themes.length];

              return (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-4 focus:ring-violet-500/20"
                >
             
                  <div
                    className={`h-2 bg-gradient-to-r ${theme.gradient}`}
                  />

            
                  <div className="p-6">
     
                    <div className="mb-6 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.soft} ${theme.icon} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="2.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M9 4V20"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M9 9H20"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                        </svg>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ${theme.badge}`}
                      >
                        {isOwner ? 'OWNER' : memberRole.toUpperCase()}
                      </span>
                    </div>

                 
                    <h3
                      className={`truncate text-lg font-bold tracking-tight text-slate-900 transition-colors ${theme.hover}`}
                    >
                      {board.title}
                    </h3>

              
                    <div className="mt-2 min-h-[52px]">
                      {board.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                          {board.description}
                        </p>
                      ) : (
                        <p className="text-sm italic text-slate-400">
                          No description provided
                        </p>
                      )}
                    </div>

               
                    <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${theme.soft} ${theme.icon}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <rect
                              x="4"
                              y="4"
                              width="16"
                              height="16"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M9 4V20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {board._count?.columns ?? 0}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {board._count?.columns === 1
                              ? 'column'
                              : 'columns'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${theme.soft} ${theme.icon}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <circle
                              cx="9"
                              cy="8"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            />
                            <path
                              d="M3.5 19C4 15.8 5.8 14 9 14C12.2 14 14 15.8 14.5 19"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                            <path
                              d="M15 5.5C17.5 5.8 18.8 7.5 18.8 9.5M16 14.2C18.2 14.8 19.5 16.2 20 18.5"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {board.members.length}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {board.members.length === 1
                              ? 'member'
                              : 'members'}
                          </p>
                        </div>
                      </div>

                
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:translate-x-1 ${theme.hover}`}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 4L13 10L7 16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom hover glow */}
                  <div
                    className={`pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${theme.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  </div>
);
}

export default function BoardsPage() {
  return (
    <ProtectedRoute>
      <BoardsPageContent />
    </ProtectedRoute>
  );
}
