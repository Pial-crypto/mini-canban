import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser,type AuthUser } from '../auth/current-user.decorator.js';
import { BoardsService } from './boards.service.js';
import {
  CreateBoardDto,
  ShareBoardDto,
  UpdateBoardDto,
  UpdateMemberRoleDto,
} from './dto/board.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.boardsService.listForUser(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.boardsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.boardsService.remove(user.userId, id);
  }

  @Post(':id/share')
  share(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ShareBoardDto,
  ) {
    return this.boardsService.share(user.userId, id, dto);
  }

  @Patch(':id/members/:memberUserId')
  updateMemberRole(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('memberUserId') memberUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.boardsService.updateMemberRole(user.userId, id, memberUserId, dto);
  }

  @Delete(':id/members/:memberUserId')
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('memberUserId') memberUserId: string,
  ) {
    return this.boardsService.removeMember(user.userId, id, memberUserId);
  }
}
