import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsString()
  boardId: string;
}

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;
}

export class ReorderColumnDto {
  @IsInt()
  @Min(0)
  targetIndex: number;
}
