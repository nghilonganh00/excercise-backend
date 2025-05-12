import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ParamQueryDto } from './dto/param-query.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Food } from './food.interface';

@Injectable()
export class FoodService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async incrementViewCount(foodId: Number): Promise<void> {
    const key = 'popular_foods';

    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      await this.redis.expire(key, 60 * 60 * 24);
    }

    await this.redis.zincrby(key, 1, String(foodId));
  }

  async getById(foodId: Number) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('Food')
      .select('*')
      .eq('id', foodId)
      .single();

    if (error) {
      throw new NotFoundException(`Không tìm thấy món ăn với id ${foodId}`);
    }

    return data;
  }

  async getPopularFoods(limit = 10): Promise<Food[]> {
    const raw = await this.redis.zrevrange(
      'popular_foods',
      0,
      limit - 1,
      'WITHSCORES',
    );

    const result: Food[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      const food = await this.getById(parseInt(raw[i]));
      result.push({ ...food, views: parseInt(raw[i + 1]) });
    }

    return result;
  }

  async getAllFoods(paramQueryDto: ParamQueryDto) {
    const {
      limit = 10,
      page = 1,
      search,
      sort = 'created_at',
      order = 'desc',
    } = paramQueryDto;

    console.log('param: ', paramQueryDto);

    if (limit > 50) {
      throw new BadRequestException('Limit must not exceed 50');
    }

    const client = this.supabaseService.getClient();

    let countQuery = client
      .from('Food')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.filter('keywords', 'ov', `{${search}}`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    let query = client
      .from('Food')
      .select('*')
      .order(sort, { ascending: order === 'asc' })
      .limit(limit)
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.filter('keywords', 'ov', `{${search}}`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count ?? 0) / limit);

    return {
      data,
      totalPages,
      currentPage: page,
      totalItems: count,
    };
  }

  async handleGetById(foodId: Number) {
    const food = await this.getById(foodId);

    this.incrementViewCount(foodId);

    return food;
  }
}
