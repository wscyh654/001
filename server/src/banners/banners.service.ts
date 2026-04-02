import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class BannersService {
  async findAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching banners:', error);
      throw new Error('获取轮播图列表失败');
    }

    return data || [];
  }

  async create(createBannerDto: {
    title?: string;
    image: string;
    link_type?: string;
    link_id?: string;
    sort_order?: number;
  }) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('banners')
      .insert({
        title: createBannerDto.title || null,
        image: createBannerDto.image,
        link_type: createBannerDto.link_type || 'none',
        link_id: createBannerDto.link_id || null,
        sort_order: createBannerDto.sort_order || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating banner:', error);
      throw new Error('创建轮播图失败');
    }

    return data;
  }

  async update(id: string, updateBannerDto: Partial<{
    title: string;
    image: string;
    link_type: string;
    link_id: string;
    sort_order: number;
    is_active: boolean;
  }>) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('banners')
      .update(updateBannerDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner:', error);
      throw new Error('更新轮播图失败');
    }

    return data;
  }

  async remove(id: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing banner:', error);
      throw new Error('删除轮播图失败');
    }
  }
}
