
'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '@/types';

interface Props {
  task: Task;
  index: number;
  canEdit: boolean;
  onUpdate: (taskId: string, data: { title?: string; description?: string }) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({
  task,
  index,
  canEdit,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');

  function save() {
    if (!title.trim()) return;

    onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setEditing(false);
  }

  return (
    <Draggable
      draggableId={task.id}
      index={index}
      isDragDisabled={!canEdit}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group mb-3 rounded-xl border bg-white text-sm transition-all duration-200 ${
            snapshot.isDragging
              ? 'border-indigo-300 shadow-[0_12px_30px_rgba(79,70,229,0.18)] ring-2 ring-indigo-400/30'
              : 'border-slate-200 shadow-[0_2px_6px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.09)]'
          }`}
        >
          {editing ? (
            <div className="p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      d="M12 20H21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16.5 3.5C16.8978 3.10218 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10218 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10218 19.5 6.5L8 18L3 19.5L4.5 14.5L16.5 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Edit task
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    Update task details
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor={`task-title-${task.id}`}
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    Title
                  </label>

                  <input
                    id={`task-title-${task.id}`}
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`task-description-${task.id}`}
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    Description
                  </label>

                  <textarea
                    id={`task-description-${task.id}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={save}
                    disabled={!title.trim()}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition-all hover:bg-indigo-700 hover:shadow-[0_6px_14px_rgba(79,70,229,0.24)] active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        d="M4 10L8 14L16 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Save changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTitle(task.title);
                      setDescription(task.description ?? '');
                      setEditing(false);
                    }}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    snapshot.isDragging
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                  }`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-3.5 w-3.5"
                  >
                    <rect
                      x="3.5"
                      y="3.5"
                      width="13"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M6.5 10L8.5 12L13.5 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 break-words font-semibold leading-5 text-slate-800">
                      {task.title}
                    </p>

                    {canEdit && (
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          title="Edit task"
                          aria-label="Edit task"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              d="M13.5 3.5L16.5 6.5M3.5 16.5L4.5 12.5L12.8 4.2C13.2 3.8 13.8 3.8 14.2 4.2L15.8 5.8C16.2 6.2 16.2 6.8 15.8 7.2L7.5 15.5L3.5 16.5Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(task.id)}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title="Delete task"
                          aria-label="Delete task"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              d="M4 5.5H16M7.5 5.5V4C7.5 3.45 7.95 3 8.5 3H11.5C12.05 3 12.5 3.45 12.5 4V5.5M6 5.5L6.5 15C6.55 15.85 7.15 16.5 8 16.5H12C12.85 16.5 13.45 15.85 13.5 15L14 5.5"
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
                      </div>
                    )}
                  </div>

                  {task.description && (
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-xs font-medium leading-5 text-slate-500">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

