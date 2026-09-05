'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-7 lg:px-8">
      <Link
        href="/boards"
        className="group flex items-center gap-2.5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_5px_14px_rgba(79,70,229,0.22)] transition-all group-hover:shadow-[0_7px_18px_rgba(79,70,229,0.28)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4.5 w-4.5"
          >
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M9 4V20M9 9H20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-tight text-slate-950 sm:text-base">
            Mini Kanban
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:block">
            Workspace
          </span>
        </div>
      </Link>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              {user.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>

            <div className="min-w-0 max-w-[220px]">
              <p className="truncate text-xs font-bold text-slate-800">
                {user.name}
              </p>
              <p className="truncate text-[10px] font-medium text-slate-400">
                {user.email}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md active:translate-y-px focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-1"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M8 4H5.5C4.67 4 4 4.67 4 5.5V14.5C4 15.33 4.67 16 5.5 16H8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M11 6.5L14.5 10L11 13.5M14 10H7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}