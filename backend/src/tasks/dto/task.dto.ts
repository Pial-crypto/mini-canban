import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  columnId: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

/**
 * Handles both same-column reordering and cross-column moves: the client
 * always supplies the destination column and the desired zero-based index
 * of the task within that column's task list (post-move).
 */
export class MoveTaskDto {
  @IsString()
  targetColumnId: string;

  @IsInt()
  @Min(0)
  targetIndex: number;
}
