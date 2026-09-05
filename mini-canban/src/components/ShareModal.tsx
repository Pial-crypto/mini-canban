
'use client';

import { FormEvent, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { BoardDetail, BoardRole } from '@/types';

interface Props {
  board: BoardDetail;
  currentUserId: string;
  onClose: () => void;
  onChanged: () => void;
}

export default function ShareModal({
  board,
  currentUserId,
  onClose,
  onChanged,
}: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<BoardRole>('EDITOR');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onInvite(e: FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.shareBoard(board.id, {
        email: email.trim(),
        role,
      });

      setEmail('');
      onChanged();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to share board',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function changeRole(
    memberUserId: string,
    newRole: BoardRole,
  ) {
    try {
      await api.updateMemberRole(
        board.id,
        memberUserId,
        newRole,
      );
      onChanged();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to update member role',
      );
    }
  }

  async function removeMember(memberUserId: string) {
    try {
      await api.removeMember(board.id, memberUserId);
      onChanged();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to remove member',
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_6px_16px_rgba(79,70,229,0.22)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <circle
                  cx="18"
                  cy="5"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="6"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="18"
                  cy="19"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8.3 10.8L15.7 6.2M8.3 13.2L15.7 17.8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                Share board
              </h2>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">
                Invite people to collaborate on “{board.title}”
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Invite a teammate
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Choose their access level before sending the invitation.
              </p>
            </div>

            <form onSubmit={onInvite}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-4 w-4"
                    >
                      <path
                        d="M3.5 5.5C3.5 4.67 4.17 4 5 4H15C15.83 4 16.5 4.67 16.5 5.5V14.5C16.5 15.33 15.83 16 15 16H5C4.17 16 3.5 15.33 3.5 14.5V5.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M4 5L10 10L16 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as BoardRole)
                      }
                      className="h-11 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition-all hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>

                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    >
                      <path
                        d="M6 8L10 12L14 8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.20)] transition-all hover:bg-indigo-700 hover:shadow-[0_6px_16px_rgba(79,70,229,0.25)] active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {submitting ? (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-4 w-4 animate-spin"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="35 15"
                          />
                        </svg>
                        Inviting
                      </>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M10 4V16M4 10H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                        Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mt-0.5 h-4 w-4 shrink-0"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 6.5V10.5M10 13.5V13.6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  People with access
                </h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Manage who can access this board.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                {board.members.length + 1}{' '}
                {board.members.length + 1 === 1 ? 'person' : 'people'}
              </span>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
                  {board.owner.name?.charAt(0).toUpperCase() ?? 'O'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {board.owner.name}
                    </p>
                    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-700">
                      Owner
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                    {board.owner.email}
                  </p>
                </div>
              </div>

              {board.members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-7 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-5 w-5"
                    >
                      <circle
                        cx="10"
                        cy="7"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5.5 16C5.9 12.9 7.4 11.5 10 11.5C12.6 11.5 14.1 12.9 14.5 16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="mt-2 text-xs font-bold text-slate-700">
                    No teammates yet
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Invite someone above to start collaborating.
                  </p>
                </div>
              ) : (
                board.members.map((m) => (
                  <div
                    key={m.id}
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3 transition-all hover:border-slate-200 hover:bg-slate-50/70"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      {m.user.name?.charAt(0).toUpperCase() ?? 'U'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {m.user.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                        {m.user.email}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {board.ownerId === currentUserId ? (
                        <>
                          <div className="relative">
                            <select
                              value={m.role}
                              onChange={(e) =>
                                changeRole(
                                  m.userId,
                                  e.target.value as BoardRole,
                                )
                              }
                              className={`h-8 cursor-pointer appearance-none rounded-lg border py-0 pl-2.5 pr-7 text-[11px] font-bold outline-none transition-all focus:ring-2 focus:ring-indigo-500/10 ${
                                m.role === 'EDITOR'
                                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
                                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300'
                              }`}
                            >
                              <option value="EDITOR">Editor</option>
                              <option value="VIEWER">Viewer</option>
                            </select>

                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-current opacity-60"
                            >
                              <path
                                d="M6 8L10 12L14 8"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMember(m.userId)}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            title="Remove member"
                            aria-label={`Remove ${m.user.name}`}
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                d="M4 5.5H16M7 5.5V4C7 3.45 7.45 3 8 3H12C12.55 3 13 3.45 13 4V5.5M6 5.5L6.5 15C6.55 15.85 7.15 16.5 8 16.5H12C12.85 16.5 13.45 15.85 13.5 15L14 5.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.5 8.5V13M11.5 8.5V13"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            m.role === 'EDITOR'
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                          }`}
                        >
                          {m.role === 'EDITOR' ? 'Editor' : 'Viewer'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

