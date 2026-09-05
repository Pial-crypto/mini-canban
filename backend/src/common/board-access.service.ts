import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BoardRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class BoardAccessService {
  constructor(private prisma: PrismaService) {}

  private roleRank(role: BoardRole): number {
    switch (role) {
      case BoardRole.OWNER:
        return 3;
      case BoardRole.EDITOR:
        return 2;
      case BoardRole.VIEWER:
        return 1;
      default:
        return 0;
    }
  }

  async getRole(userId: string, boardId: string): Promise<BoardRole | null> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });
    if (!board) return null;
    if (board.ownerId === userId) return BoardRole.OWNER;

    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    return membership?.role ?? null;
  }


  async requireRole(
    userId: string,
    boardId: string,
    minRole: BoardRole = BoardRole.VIEWER,
  ): Promise<BoardRole> {
    const role = await this.getRole(userId, boardId);
    if (!role) {
      throw new NotFoundException('Board not found');
    }
    if (this.roleRank(role) < this.roleRank(minRole)) {
      throw new ForbiddenException('Insufficient permissions for this board');
    }
    return role;
  }

  async getBoardIdForColumn(columnId: string): Promise<string> {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });
    if (!column) throw new NotFoundException('Column not found');
    return column.boardId;
  }

  async getBoardIdForTask(taskId: string): Promise<string> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { column: { select: { boardId: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task.column.boardId;
  }
}
