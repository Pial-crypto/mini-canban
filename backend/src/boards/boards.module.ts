import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service.js';
import { BoardsController } from './boards.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
