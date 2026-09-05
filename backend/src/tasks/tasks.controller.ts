import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto, MoveTaskDto, UpdateTaskDto } from './dto/task.dto.js';
import { RateLimit } from '../common/decorators/rate-limit.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
@RateLimit({
  limit: 5,
  windowMs: 60_000,
})
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.userId, dto);
  }
  
  @RateLimit({
    limit: 5,
    windowMs: 60_000,
  })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    // console.log("hello")
    return this.tasksService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tasksService.remove(user.userId, id);
  }

 
  @Patch(':id/move')
  move(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(user.userId, id, dto);
  }
}
