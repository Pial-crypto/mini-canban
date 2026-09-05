
import { User, BoardDetail,
  BoardMember,
  BoardRole,
  BoardSummary,
  Column,
  Task, } from '../app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'kanban_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  console.log('Requesting', { path, options, token });
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message;
    } catch(error) {
      console.error('Failed to parse error response', error);
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    request<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<User>('/auth/me'),

  // Boards
  listBoards: () => request<BoardSummary[]>('/boards'),
  getBoard: (id: string) => request<BoardDetail>(`/boards/${id}`),
  createBoard: (data: { title: string; description?: string }) =>
    request<BoardSummary>('/boards', { method: 'POST', body: JSON.stringify(data) }),
  updateBoard: (id: string, data: { title?: string; description?: string }) =>
    request<BoardSummary>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBoard: (id: string) => request<{ success: boolean }>(`/boards/${id}`, { method: 'DELETE' }),
  shareBoard: (id: string, data: { email: string; role?: BoardRole }) =>
    request<BoardMember>(`/boards/${id}/share`, { method: 'POST', body: JSON.stringify(data) }),
  updateMemberRole: (boardId: string, memberUserId: string, role: BoardRole) =>
    request<BoardMember>(`/boards/${boardId}/members/${memberUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  removeMember: (boardId: string, memberUserId: string) =>
    request<{ success: boolean }>(`/boards/${boardId}/members/${memberUserId}`, {
      method: 'DELETE',
    }),

  // Columns
  createColumn: (data: { title: string; boardId: string }) =>
    request<Column>('/columns', { method: 'POST', body: JSON.stringify(data) }),
  updateColumn: (id: string, data: { title: string }) =>
    request<Column>(`/columns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteColumn: (id: string) => request<{ success: boolean }>(`/columns/${id}`, { method: 'DELETE' }),
  reorderColumn: (id: string, targetIndex: number) =>
    request<Column>(`/columns/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ targetIndex }),
    }),

  // Tasks
  createTask: (data: { title: string; description?: string; columnId: string }) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: { title?: string; description?: string }) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
  moveTask: (id: string, data: { targetColumnId: string; targetIndex: number }) =>
    request<Task>(`/tasks/${id}/move`, { method: 'PATCH', body: JSON.stringify(data) }),
};
