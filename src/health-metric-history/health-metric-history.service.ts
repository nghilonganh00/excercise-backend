import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateHealthMetricHistoryDto } from './dtos/create-health-metric-history.dto';
import { calculateAge } from './utils/age-calculator.util';
import { calculateLeanBodyMass } from './utils/lean-body-mass.util';
import { calculateBodyFatPercentage } from './utils/body-fat.util';

@Injectable()
export class HealthMetricHistoryService {
  constructor(private readonly supaService: SupabaseService) {}

  async handleGetLatest(userId: string) {
    const client = this.supaService.getClient();

    try {
      const { data: user, error: findUserError } = await client
        .from('User')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: historyData, error: findHistoryError } = await client
        .from('HealthMetricHistory')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (findHistoryError) throw new Error(findHistoryError.message);

      return { ...historyData[0], age: calculateAge(user.date_of_birth) };
    } catch (error) {
      console.error('Error fetching health history:', error);
      throw new Error('Something went wrong while fetching health history.');
    }
  }

  async handleGetByMonthRange(userId: string, month1: number, month2: number) {
    const client = this.supaService.getClient();

    try {
      const startDate = new Date(new Date().getFullYear(), month1 - 1, 1);
      const endDate = new Date(new Date().getFullYear(), month2, 0);

      const { data: user, error: findUserError } = await client
        .from('User')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: historyData, error: findHistoryError } = await client
        .from('HealthMetricHistory')
        .select('*')
        .eq('userId', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (findHistoryError) throw new Error(findHistoryError.message);

      return historyData.map((item) => ({
        ...item,
        age: calculateAge(user.date_of_birth),
      }));
    } catch (error) {
      console.error(
        'Error fetching health history for the month range:',
        error,
      );
      throw new Error(
        'Something went wrong while fetching health history for the month range.',
      );
    }
  }

  async handleCreate(
    userId: string,
    createHealthMetricHistoryDto: CreateHealthMetricHistoryDto,
  ) {
    const { height, weight, neck, waist } = createHealthMetricHistoryDto;
    console.log('height: ', height);

    const client = this.supaService.getClient();

    const { data: user, error: findError } = await client
      .from('User')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const age = calculateAge(user.date_of_birth);
    const lbm = calculateLeanBodyMass(weight, height, age, user.gender);
    const bfp = calculateBodyFatPercentage(user.gender, height, waist, neck);

    const { data: savedSchedule, error: insertError } = await client
      .from('HealthMetricHistory')
      .insert([
        {
          userId,
          height,
          weight,
          neck,
          waist,
          lbm,
          bfp,
        },
      ])
      .select();

    if (insertError) throw new Error(insertError.message);
    return savedSchedule;
  }
}
