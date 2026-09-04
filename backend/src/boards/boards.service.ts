import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoardAccessService } from '../common/board-access.service.js';
import { CreateBoardDto, ShareBoardDto, UpdateBoardDto, UpdateMemberRoleDto } from './dto/board.dto.js';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private access: BoardAccessService,
  ) {}

  private boardInclude = {
    owner: { select: { id: true, name: true, email: true } },
    members: {
      include: { user: { select: { id: true, name: true, email: true } } },
    },
    _count: { select: { columns: true } },
  } as const;


  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
      },
      include: this.boardInclude,
    });
  }

  /** All boards the user owns or has been granted membership on. */
  async listForUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: this.boardInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, boardId: string) {
    await this.access.requireRole(userId, boardId, BoardRole.VIEWER);
    // console.log('findOne', { userId, boardId });
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        ...this.boardInclude,
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
    // console.log('findOne result', { board });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(userId: string, boardId: string, dto: UpdateBoardDto) {
    // console.log('update', { userId, boardId, dto });
    await this.access.requireRole(userId, boardId, BoardRole.EDITOR);
    return this.prisma.board.update({
      where: { id: boardId },
      data: dto,
      include: this.boardInclude,
    });
  }

  async remove(userId: string, boardId: string) {
    // console.log('remove', { userId, boardId });
    await this.access.requireRole(userId, boardId, BoardRole.OWNER);
    await this.prisma.board.delete({ where: { id: boardId } });
    return { success: true };
  }

  async share(userId: string, boardId: string, dto: ShareBoardDto) {
    await this.access.requireRole(userId, boardId, BoardRole.OWNER);

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!targetUser) {
      // console.log("not found target user")
      // console.log('share', { userId, boardId, dto, targetUser });
      throw new NotFoundException('No registered user with that email');
    }

    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (board?.ownerId === targetUser.id) {
      throw new BadRequestException('User already owns this board');
    }

    return this.prisma.boardMember.upsert({
      where: { boardId_userId: { boardId, userId: targetUser.id } },
      update: { role: dto.role ?? BoardRole.EDITOR },
      create: {
        boardId,
        userId: targetUser.id,
        role: dto.role ?? BoardRole.EDITOR,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateMemberRole(
    userId: string,
    boardId: string,
    memberUserId: string,
    dto: UpdateMemberRoleDto,
  ) {

    await this.access.requireRole(userId, boardId, BoardRole.OWNER);
    return this.prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId: memberUserId } },
      data: { role: dto.role },
    });
  }

  async removeMember(userId: string, boardId: string, memberUserId: string) {
    // console.log('removeMember', { userId, boardId, memberUserId });
    await this.access.requireRole(userId, boardId, BoardRole.OWNER);
    if (memberUserId === userId) {
      console.log("i am inside memberUserId === userId")
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    await this.prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId: memberUserId } },
    });
    return { success: true };
  }
}
