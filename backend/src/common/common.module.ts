import { Global, Module } from '@nestjs/common';
import { BoardAccessService } from './board-access.service.js';
import { PositionService } from './position.service.js';

@Global()
@Module({
  providers: [BoardAccessService, PositionService],
  exports: [BoardAccessService, PositionService],
})
export class CommonModule {}
