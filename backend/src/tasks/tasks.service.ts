import { BadRequestException, Injectable } from '@nestjs/common';
import { BoardRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardAccessService } from '../common/board-access.service.js';
import { PositionService } from '../common/position.service.js';
import { CreateTaskDto, MoveTaskDto, UpdateTaskDto } from './dto/task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private access: BoardAccessService,
    private positions: PositionService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const boardId = await this.access.getBoardIdForColumn(dto.columnId);
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
// console.log("inside creation",userId, dto.columnId, boardId);
    const siblings = await this.prisma.task.findMany({
      where: { columnId: dto.columnId },
      select: { position: true },
    });

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        columnId: dto.columnId,
        position: this.positions.nextPosition(siblings.map((s) => s.position)),
      },
    });
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    // console.log("check",userId, taskId, dto);
    const boardId = await this.access.getBoardIdForTask(taskId);
    // console.log("boardId", boardId);
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
    return this.prisma.task.update({ where: { id: taskId }, data: dto });
  }

  async remove(userId: string, taskId: string) {
    // console.log("check",userId, taskId);
    const boardId = await this.access.getBoardIdForTask(taskId);
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
    await this.prisma.task.delete({ where: { id: taskId } });
    // console.log("successfully deleted task with id:", taskId);
    return { success: true };
  }


  async move(userId: string, taskId: string, dto: MoveTaskDto) {
    // console.log("check",userId, taskId, dto);
    const sourceBoardId = await this.access.getBoardIdForTask(taskId);
    await this.access.requireRole(userId, sourceBoardId, BoardRole.EDITOR);

    const targetBoardId = await this.access.getBoardIdForColumn(dto.targetColumnId);
    if (targetBoardId !== sourceBoardId) {
      // console.log("in match")
      // console.log('move', { userId, taskId, dto, sourceBoardId, targetBoardId });
      throw new BadRequestException('Cannot move a task to a column on a different board');
    }

    return this.prisma.$transaction(async (tx) => {
      const targetSiblings = await tx.task.findMany({
        where: { columnId: dto.targetColumnId, NOT: { id: taskId } },
        orderBy: { position: 'asc' },
      });

      const clampedIndex = Math.max(0, Math.min(dto.targetIndex, targetSiblings.length));
      const before = targetSiblings[clampedIndex - 1];
      const after = targetSiblings[clampedIndex];
      const newPosition = this.positions.between(before?.position, after?.position);
      // console.log(clampedIndex, before?.position, after?.position, newPosition);

      return tx.task.update({
        where: { id: taskId },
        data: { columnId: dto.targetColumnId, position: newPosition },
      });
    });
  }
}
