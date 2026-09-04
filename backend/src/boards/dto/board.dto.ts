import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BoardRole } from '@prisma/client';

export class CreateBoardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class ShareBoardDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(BoardRole)
  role?: BoardRole;
}

export class UpdateMemberRoleDto {
  @IsEnum(BoardRole)
  role: BoardRole;
}
