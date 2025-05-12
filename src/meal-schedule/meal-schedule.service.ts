import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { format, subDays } from 'date-fns';
import { addDays } from 'date-fns';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class MealScheduleService {
  constructor(
    private readonly supaService: SupabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  private getDaysInInterval(startDate: Date, endDate: Date): string[] {
    const days: string[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      days.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }

    return days;
  }

  async handleGetFoodsOnSchedule(userId: string, date: string) {
    const client = this.supaService.getClient();

    const start = new Date(`${date}T00:00:00Z`);

    const end = new Date(`${date}T23:59:59Z`);

    const startOfDay = start.toISOString();
    const endOfDay = end.toISOString();

    const { data, error } = await client
      .from('MealSchedule')
      .select(
        `
      *,
      food:foodId (*)
    `,
      )
      .eq('userId', userId)
      .gte('mealTime', startOfDay)
      .lte('mealTime', endOfDay)
      .order('mealTime', { ascending: true });

    if (error) throw new Error(error.message);

    return data;
  }

  async handleGetNutrition(userId: string, duration: string) {
    const client = this.supaService.getClient();

    const now = new Date();
    let fromDate: Date;

    switch (duration) {
      case 'day':
        fromDate = subDays(now, 1);
        break;
      case 'week':
        fromDate = subDays(now, 7);
        break;
      case 'month':
        fromDate = subDays(now, 30);
        break;
      default:
        fromDate = subDays(now, 1);
    }

    const fromDateString = fromDate.toISOString();

    const { data, error } = await client
      .from('MealSchedule')
      .select(
        `
      *,
      food:foodId (*)
    `,
      )
      .eq('userId', userId)
      .gte('created_at', fromDateString);

    if (error) {
      throw new Error('Không thể lấy dữ liệu từ Supabase');
    }

    // Gộp dữ liệu theo ngày
    const groupedByDate: Record<string, any> = {};

    for (const item of data) {
      const dateKey = format(new Date(item.created_at), 'yyyy-MM-dd');
      const food = item.food || {};

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }

      groupedByDate[dateKey].calories += food.kcal || 0;
      groupedByDate[dateKey].protein += food.protein || 0;
      groupedByDate[dateKey].carbs += food.carbo || 0;
      groupedByDate[dateKey].fat += food.fat || 0;
    }

    // Tạo danh sách đầy đủ từ fromDate → today
    const fullDateList = this.getDaysInInterval(fromDate, now);

    const result: any[] = fullDateList.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return (
        groupedByDate[dateKey] || {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }
      );
    });

    return result;
  }

  async handleGetDetail(userId: string, id: number) {
    const client = this.supaService.getClient();

    const { data, error } = await client
      .from('MealSchedule')
      .select('*, food:foodId (*)')
      .eq('id', id)
      .eq('userId', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Không thể lấy chi tiết: ${error.message}`);
    }

    return data;
  }

  async handleCreate(userId: string, newSchedule: CreateScheduleDto) {
    const { foodId, quantity, mealTime } = newSchedule;

    const client = this.supaService.getClient();

    console.log('mealTime: ', mealTime);

    const { data: food, error: findFoodError } = await client
      .from('Food')
      .select('*')
      .eq('id', foodId)
      .maybeSingle();

    const { data: existing, error: findError } = await client
      .from('MealSchedule')
      .select('*')
      .eq('userId', userId)
      .eq('mealTime', mealTime)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (existing) {
      const { data: updated, error: updateError } = await client
        .from('MealSchedule')
        .update({
          foodId,
          quantity,
        })
        .eq('id', existing.id)
        .select();

      if (updateError) throw new Error(updateError.message);
      return updated;
    } else {
      const { data: savedSchedule, error: insertError } = await client
        .from('MealSchedule')
        .insert([
          {
            foodId,
            quantity,
            mealTime,
            userId,
          },
        ])
        .select();

      if (insertError) throw new Error(insertError.message);

      let delayMs = new Date(mealTime).getTime() - Date.now() - 30 * 60 * 1000;

      if (delayMs < 0) {
        delayMs = 0;
      }

      console.log('mealTime: ', mealTime);
      console.log(new Date());
      console.log(delayMs);

      const formattedMealTime = format(new Date(mealTime), 'hh:mm a');

      await this.notificationService.scheduleNotification(
        userId,
        '🕒 Sắp đến giờ ăn!',
        `Chuẩn bị món ${food.name} (${quantity} phần) bạn đã đặt lịch lúc ${formattedMealTime}! 🍽️ Đừng quên thưởng thức bữa ăn đầy năng lượng nhé!`,
        delayMs,
      );

      return savedSchedule;
    }
  }

  async handleUpdate(
    userId: string,
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ) {
    console.log('id: ', id);
    const { foodId, quantity, mealTime } = updateScheduleDto;
    console.log('updateScheduleDto: ', updateScheduleDto);
    const client = this.supaService.getClient();

    const { data: food, error: findFoodError } = await client
      .from('Food')
      .select('*')
      .eq('id', foodId)
      .maybeSingle();

    const { data, error } = await client
      .from('MealSchedule')
      .update({ foodId, quantity, mealTime, userId })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Lỗi Supabase:', error);
      throw new Error(`Không thể cập nhật: ${error.message}`);
    }

    if (!data) {
      console.error('⚠️ Không tìm thấy dữ liệu sau khi cập nhật.');
      throw new Error('Không thể cập nhật: không có dữ liệu trả về');
    }

    let delayMs = new Date(mealTime).getTime() - Date.now() - 30 * 60 * 1000;

    if (delayMs < 0) {
      delayMs = 0;
    }

    console.log('mealTime: ', mealTime);
    console.log(new Date());
    console.log(delayMs);

    const formattedMealTime = format(new Date(mealTime), 'hh:mm a');

    await this.notificationService.scheduleNotification(
      userId,
      '🕒 Sắp đến giờ ăn!',
      `Chuẩn bị món ${food.name} (${quantity} phần) bạn đã đặt lịch lúc ${formattedMealTime}! 🍽️ Đừng quên thưởng thức bữa ăn đầy năng lượng nhé!`,
      delayMs,
    );

    console.log('✅ Cập nhật thành công:', data);
    return data;
  }

  async handleRemove(userId: string, scheduleId: number) {
    const client = this.supaService.getClient();

    const { data, error } = await client
      .from('MealSchedule')
      .delete()
      .eq('userId', userId)
      .eq('id', scheduleId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
