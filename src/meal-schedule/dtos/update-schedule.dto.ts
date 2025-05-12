import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class UpdateScheduleDto {
  @IsInt({ message: 'foodId phải là số nguyên' })
  @IsPositive({ message: 'foodId phải lớn hơn 0' })
  foodId: number;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsPositive({ message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @IsDateString(
    {},
    { message: 'mealTime phải là định dạng ngày giờ hợp lệ (ISO 8601)' },
  )
  mealTime: string;
}
