import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class TrainingSessionService {
  constructor(private readonly supaService: SupabaseService) {}

  async handleGetAll(date: string) {
    const client = this.supaService.getClient();

    const start = new Date(`${date}T00:00:00Z`);

    const end = new Date(`${date}T23:59:59Z`);

    const startOfDay = start.toISOString();
    const endOfDay = end.toISOString();

    const { data, error } = await client
      .from('TrainingSession')
      .select(
        `
        *,
        workout:workoutId (*)
        `,
      )
      .eq('userId', '97f9922b-6c10-49a8-bfad-0d1791006cfc')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return data;
  }

  async handleGetAllByDuration(duration: string) {
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
      .from('TrainingSession')
      .select(
        `
        *
        `,
      )
      .eq('userId', '97f9922b-6c10-49a8-bfad-0d1791006cfc')
      .gte('created_at', fromDateString)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return data;
  }
}
