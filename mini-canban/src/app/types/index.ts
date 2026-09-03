export type BoardRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface BoardSummary {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  createdAt: string;
  updatedAt: string;
  _count?: { columns: number };
}

export interface BoardDetail extends BoardSummary {
  columns: Column[];
}
