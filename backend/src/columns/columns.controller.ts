import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser,type AuthUser } from '../auth/current-user.decorator.js';
import { ColumnsService } from './columns.service.js';
import { CreateColumnDto, ReorderColumnDto, UpdateColumnDto } from './dto/column.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateColumnDto) {
    return this.columnsService.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.columnsService.remove(user.userId, id);
  }

  @Patch(':id/reorder')
  reorder(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReorderColumnDto,
  ) {
    return this.columnsService.reorder(user.userId, id, dto);
  }
}
