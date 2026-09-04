import { Injectable } from '@nestjs/common';
import { BoardRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardAccessService } from '../common/board-access.service.js';
import { PositionService } from '../common/position.service.js';
import { CreateColumnDto, ReorderColumnDto, UpdateColumnDto } from './dto/column.dto.js';

@Injectable()
export class ColumnsService {
  constructor(
    private prisma: PrismaService,
    private access: BoardAccessService,
    private positions: PositionService,
  ) {}

  async create(userId: string, dto: CreateColumnDto) {
    await this.access.requireRole(userId, dto.boardId, BoardRole.EDITOR);

    const siblings = await this.prisma.column.findMany({
      where: { boardId: dto.boardId },
      select: { position: true },
    });
    // console.log('siblings', siblings.map((s) => s.position));
// console.log('next position', this.positions.nextPosition(siblings.map((s) => s.position)));
    return this.prisma.column.create({
      data: {
        title: dto.title,
        boardId: dto.boardId,
        position: this.positions.nextPosition(siblings.map((s) => s.position)),
      },
      include: { tasks: true },
    });
  }

  async update(userId: string, columnId: string, dto: UpdateColumnDto) {
    const boardId = await this.access.getBoardIdForColumn(columnId);
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
    return this.prisma.column.update({ where: { id: columnId }, data: dto });
  }

  async remove(userId: string, columnId: string) {
    const boardId = await this.access.getBoardIdForColumn(columnId);
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
    await this.prisma.column.delete({ where: { id: columnId } });
    return { success: true };
  }


  async reorder(userId: string, columnId: string, dto: ReorderColumnDto) {
    const boardId = await this.access.getBoardIdForColumn(columnId);
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
    // console.log('reorder', { userId, columnId, dto, boardId });

    return this.prisma.$transaction(async (tx) => {
      const siblings = await tx.column.findMany({
        where: { boardId },
        orderBy: { position: 'asc' },
      });

      const withoutMoved = siblings.filter((c) => c.id !== columnId);
      const clampedIndex = Math.max(0, Math.min(dto.targetIndex, withoutMoved.length));

      const before = withoutMoved[clampedIndex - 1];
      const after = withoutMoved[clampedIndex];
      const newPosition = this.positions.between(before?.position, after?.position);
// console.log('reorder', {  
// userId, columnId, dto, boardId, siblings, withoutMoved, clampedIndex, before, after, newPosition });

      return tx.column.update({
        where: { id: columnId },
        data: { position: newPosition },
      });
    });
  }
}
