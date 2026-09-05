'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import BoardColumn from '@/components/BoardColumn';
import ShareModal from '@/components/ShareModal';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { BoardDetail, Column } from '@/types';

function BoardPageContent() {
  const params = useParams<{ id: string }>();
  const boardId = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.getBoard(boardId);
      setBoard(data);
      setColumns(data.columns);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
        setError("You don't have access to this board, or it doesn't exist.");
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to load board');
      }
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    load();
  }, [load]);

  const role = board
    ? board.ownerId === user?.id
      ? 'OWNER'
      : board.members.find((m) => m.userId === user?.id)?.role ?? null
    : null;

  const canEdit = role === 'OWNER' || role === 'EDITOR';
  const isOwner = role === 'OWNER';

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (!canEdit) return;

    if (type === 'COLUMN') {
      const reordered = Array.from(columns);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setColumns(reordered);
      api.reorderColumn(draggableId, destination.index).catch(load);
      return;
    }

    setColumns((prev) => {
      const sourceIdx = prev.findIndex((c) => c.id === source.droppableId);
      const destIdx = prev.findIndex((c) => c.id === destination.droppableId);

      if (sourceIdx === -1 || destIdx === -1) return prev;

      const next = prev.map((c) => ({
        ...c,
        tasks: [...c.tasks],
      }));

      const [movedTask] = next[sourceIdx].tasks.splice(source.index, 1);

      next[destIdx].tasks.splice(destination.index, 0, {
        ...movedTask,
        columnId: next[destIdx].id,
      });

      return next;
    });

    api
      .moveTask(draggableId, {
        targetColumnId: destination.droppableId,
        targetIndex: destination.index,
      })
      .catch(load);
  }

  async function addColumn(e: FormEvent) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    try {
      const col = await api.createColumn({
        title: newColumnTitle.trim(),
        boardId,
      });

      setColumns((prev) => [...prev, { ...col, tasks: [] }]);
      setNewColumnTitle('');
      setAddingColumn(false);
    } catch {
      load();
    }
  }

  async function renameColumn(columnId: string, title: string) {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, title } : c)),
    );

    try {
      await api.updateColumn(columnId, { title });
    } catch {
      load();
    }
  }

  async function deleteColumn(columnId: string) {
    if (!confirm('Delete this column and all its tasks?')) return;

    setColumns((prev) => prev.filter((c) => c.id !== columnId));

    try {
      await api.deleteColumn(columnId);
    } catch {
      load();
    }
  }

  async function addTask(columnId: string, title: string) {
    try {
      const task = await api.createTask({ title, columnId });

      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId
            ? { ...c, tasks: [...c.tasks, task] }
            : c,
        ),
      );
    } catch {
      load();
    }
  }

  async function updateTask(
    taskId: string,
    data: { title?: string; description?: string },
  ) {
    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) =>
          t.id === taskId ? { ...t, ...data } : t,
        ),
      })),
    );

    try {
      await api.updateTask(taskId, data);
    } catch {
      load();
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;

    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        tasks: c.tasks.filter((t) => t.id !== taskId),
      })),
    );

    try {
      await api.deleteTask(taskId);
    } catch {
      load();
    }
  }

  async function deleteBoard() {
    if (!confirm('Delete this board permanently? This cannot be undone.')) {
      return;
    }

    await api.deleteBoard(boardId);
    router.push('/boards');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />

        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 animate-spin text-slate-500"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="20 30"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-sm font-medium text-slate-500">
              Loading board...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />

        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8V13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="16.5"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </div>

            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Unable to open board
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ?? 'This board could not be found.'}
            </p>

            <Link
              href="/boards"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M12.5 4L6.5 10L12.5 16"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to boards
            </Link>
          </div>
        </main>
      </div>
    );
  }

return (
  <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
    <Navbar />

    <header className="shrink-0 border-b border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex min-h-[104px] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-8">
        <div className="min-w-0">
          <Link
            href="/boards"
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M12.5 4L6.5 10L12.5 16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All boards
          </Link>

          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] ring-1 ring-indigo-500/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5.5 w-5.5"
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

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  {board.title}
                </h1>

                {isOwner && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-indigo-700 ring-1 ring-inset ring-indigo-200 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
                    Owner
                  </span>
                )}

                {!isOwner && canEdit && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700 ring-1 ring-inset ring-blue-200 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]" />
                    Editor
                  </span>
                )}

                {!canEdit && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-inset ring-amber-200 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" />
                    View only
                  </span>
                )}
              </div>

              {board.description && (
                <p className="mt-1 max-w-2xl truncate text-sm font-medium text-slate-500">
                  {board.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {!canEdit && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 sm:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              View only
            </span>
          )}

          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.22)] transition-all hover:bg-indigo-700 hover:shadow-[0_6px_16px_rgba(79,70,229,0.28)] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
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
                Share
              </button>

              <button
                type="button"
                onClick={deleteBoard}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow-md active:translate-y-px focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                >
                  <path
                    d="M5 7H19M9 7V5.5C9 4.7 9.7 4 10.5 4H13.5C14.3 4 15 4.7 15 5.5V7M7 7L7.7 18C7.8 19.1 8.7 20 9.8 20H14.2C15.3 20 16.2 19.1 16.3 18L17 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 11V16M14 11V16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </header>

    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId="board"
        type="COLUMN"
        direction="horizontal"
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-slate-50"
          >
            <div className="flex min-h-full items-start gap-5 px-5 py-7 sm:px-7 lg:px-8">
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className="w-[320px] shrink-0 sm:w-[340px]"
                >
              <div
  key={column.id}
  className="w-[320px] shrink-0 sm:w-[340px]"
>
  <BoardColumn
    column={column}
    index={index}
    canEdit={canEdit}
    onAddTask={addTask}
    onUpdateTask={updateTask}
    onDeleteTask={deleteTask}
    onRenameColumn={renameColumn}
    onDeleteColumn={deleteColumn}
  />
</div>
                </div>
              ))}

              {provided.placeholder}

              {canEdit && (
                <>
                  <div className="flex h-[520px] w-px shrink-0 items-center px-1">
                    <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                  </div>

                  <div className="w-[320px] shrink-0 sm:w-[340px]">
                    {addingColumn ? (
                      <form
                        onSubmit={addColumn}
                        className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-[0_8px_30px_rgba(79,70,229,0.10)] ring-1 ring-indigo-50"
                      >
                        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-white px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.22)]">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-5 w-5"
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
                              <h3 className="text-sm font-bold text-slate-950">
                                New column
                              </h3>
                              <p className="mt-0.5 text-xs font-medium text-slate-500">
                                Add a new workflow stage
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <label
                            htmlFor="column-title"
                            className="mb-2 block text-xs font-bold text-slate-700"
                          >
                            Column name
                          </label>

                          <input
                            id="column-title"
                            autoFocus
                            value={newColumnTitle}
                            onChange={(e) =>
                              setNewColumnTitle(e.target.value)
                            }
                            placeholder="e.g. In progress"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                          />

                          <div className="mt-3 flex gap-2.5">
                            <button
                              type="submit"
                              disabled={!newColumnTitle.trim()}
                              className="flex-1 cursor-pointer rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition-all hover:bg-indigo-700 hover:shadow-[0_6px_14px_rgba(79,70,229,0.24)] active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                            >
                              Add column
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAddingColumn(false);
                                setNewColumnTitle('');
                              }}
                              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingColumn(true)}
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-[0_8px_24px_rgba(79,70,229,0.10)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(79,70,229,0.22)]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
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
                          <p className="text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-700">
                            Add another column
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Create a new workflow stage
                          </p>
                        </div>

                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-500"
                        >
                          <path
                            d="M7 4L13 10L7 16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>

    {shareOpen && user && (
      <ShareModal
        board={board}
        currentUserId={user.id}
        onClose={() => setShareOpen(false)}
        onChanged={load}
      />
    )}
  </div>
);
}

export default function BoardPage() {
  return (
    <ProtectedRoute>
      <BoardPageContent />
    </ProtectedRoute>
  );
}