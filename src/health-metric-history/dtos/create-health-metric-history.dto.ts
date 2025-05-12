import { IsNumber, IsString, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHealthMetricHistoryDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsString()
  @IsUUID()
  userId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  height: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  neck: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  waist: number;
}
