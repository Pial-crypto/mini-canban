'use client';

import { FormEvent, useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import type { Column, Task } from '@/types';

interface Props {
  column: Column;
  index: number;
  canEdit: boolean;
  onAddTask: (columnId: string, title: string) => void;
  onUpdateTask: (
    taskId: string,
    data: { title?: string; description?: string },
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export default function BoardColumn({
  column,
  index,
  canEdit,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onRenameColumn,
  onDeleteColumn,
}: Props) {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);

  function submitTask(e: FormEvent) {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    onAddTask(column.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setAddingTask(false);
  }

  function saveTitle() {
    const trimmedTitle = titleDraft.trim();

    if (trimmedTitle && trimmedTitle !== column.title) {
      onRenameColumn(column.id, trimmedTitle);
    }

    setEditingTitle(false);
  }

  function cancelTitleEdit() {
    setTitleDraft(column.title);
    setEditingTitle(false);
  }

  return (
    <Draggable
      draggableId={column.id}
      index={index}
      isDragDisabled={!canEdit}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex w-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
            snapshot.isDragging
              ? 'border-indigo-300 shadow-[0_16px_35px_rgba(79,70,229,0.18)] ring-2 ring-indigo-400/20'
              : 'border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.09)]'
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-3.5 py-3"
          >
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveTitle();
                    }

                    if (e.key === 'Escape') {
                      cancelTitleEdit();
                    }
                  }}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2.5 text-sm font-bold text-slate-900 outline-none ring-4 ring-indigo-500/10"
                />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={saveTitle}
                  className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  title="Save"
                  aria-label="Save column name"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <path
                      d="M4 10L8 14L16 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <rect
                      x="3.5"
                      y="3"
                      width="13"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 3V17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (canEdit) {
                      setTitleDraft(column.title);
                      setEditingTitle(true);
                    }
                  }}
                  className={`min-w-0 flex-1 truncate text-left text-sm font-bold text-slate-800 ${
                    canEdit
                      ? 'cursor-pointer transition-colors hover:text-indigo-600'
                      : 'cursor-default'
                  }`}
                  title={canEdit ? 'Rename column' : column.title}
                >
                  {column.title}
                </button>

                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-[10px] font-bold text-slate-500">
                  {column.tasks.length}
                </span>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onDeleteColumn(column.id)}
                    className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    title="Delete column"
                    aria-label={`Delete ${column.title} column`}
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
                )}
              </div>
            )}
          </div>

          <Droppable droppableId={column.id} type="TASK">
            {(dropProvided, dropSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className={`min-h-[80px] flex-1 px-2.5 py-3 transition-colors duration-200 ${
                  dropSnapshot.isDraggingOver
                    ? 'bg-indigo-50/70'
                    : 'bg-slate-50/30'
                }`}
              >
                {column.tasks.length === 0 &&
                !dropSnapshot.isDraggingOver ? (
                  <div className="flex min-h-[70px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70">
                    <div className="text-center">
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M10 4V16M4 10H16"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                        No tasks yet
                      </p>
                    </div>
                  </div>
                ) : (
                  column.tasks.map(
                    (task: Task, taskIndex: number) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={taskIndex}
                        canEdit={canEdit}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                      />
                    ),
                  )
                )}

                {dropProvided.placeholder}

                {dropSnapshot.isDraggingOver && (
                  <div className="mt-1 flex h-16 items-center justify-center rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60">
                    <span className="text-[11px] font-bold text-indigo-500">
                      Drop task here
                    </span>
                  </div>
                )}
              </div>
            )}
          </Droppable>

          {canEdit &&
            (addingTask ? (
              <form
                onSubmit={submitTask}
                className="border-t border-slate-100 bg-white p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        d="M10 4V16M4 10H16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    Add new task
                  </p>
                </div>

                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition-all hover:bg-indigo-700 hover:shadow-[0_6px_14px_rgba(79,70,229,0.23)] active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        d="M4 10L8 14L16 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    Add task
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddingTask(false);
                      setNewTaskTitle('');
                    }}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300/50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAddingTask(true)}
                className="group flex items-center gap-2 border-t border-slate-100 bg-white px-3.5 py-3 text-left text-sm font-semibold text-slate-500 transition-all hover:bg-indigo-50/50 hover:text-indigo-600"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-all group-hover:bg-indigo-100 group-hover:text-indigo-600">
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
                </span>

                <span>Add a task</span>
              </button>
            ))}
        </div>
      )}
    </Draggable>
  );
}