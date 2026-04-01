import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class DishesService {
  async findAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dishes')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dishes:', error);
      throw new Error('获取菜品列表失败');
    }

    return data || [];
  }

  async findOne(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dishes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dish:', error);
      throw new Error('获取菜品详情失败');
    }

    return data;
  }
}
