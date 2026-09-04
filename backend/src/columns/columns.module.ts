import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service.js';
import { ColumnsController } from './columns.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
