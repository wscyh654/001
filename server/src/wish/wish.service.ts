import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class WishService {
  async findAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('wish_dishes')
      .select('*')
      .eq('is_active', true)
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishes:', error);
      throw new Error('获取心愿列表失败');
    }

    return data || [];
  }

  async create(createWishDto: { dish_name: string; description?: string; user_id?: string }) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('wish_dishes')
      .insert({
        user_id: createWishDto.user_id || null,
        dish_name: createWishDto.dish_name,
        description: createWishDto.description || null,
        vote_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wish:', error);
      throw new Error('创建心愿失败');
    }

    return data;
  }

  async vote(wishId: string, userId: string) {
    const client = getSupabaseClient();

    // 检查是否已投票
    const { data: existingVote } = await client
      .from('wish_votes')
      .select('*')
      .eq('wish_id', wishId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // 已投票，取消投票
      await client
        .from('wish_votes')
        .delete()
        .eq('wish_id', wishId)
        .eq('user_id', userId);

      // 减少投票数
      const { data: wish } = await client
        .from('wish_dishes')
        .select('vote_count')
        .eq('id', wishId)
        .single();

      if (wish) {
        await client
          .from('wish_dishes')
          .update({ vote_count: Math.max(0, wish.vote_count - 1) })
          .eq('id', wishId);
      }

      return { voted: false };
    } else {
      // 未投票，添加投票
      await client.from('wish_votes').insert({
        wish_id: wishId,
        user_id: userId,
      });

      // 增加投票数
      const { data: wish } = await client
        .from('wish_dishes')
        .select('vote_count')
        .eq('id', wishId)
        .single();

      if (wish) {
        await client
          .from('wish_dishes')
          .update({ vote_count: wish.vote_count + 1 })
          .eq('id', wishId);
      }

      return { voted: true };
    }
  }

  async update(id: string, updateDto: { dish_name?: string; description?: string }, userId: string) {
    const client = getSupabaseClient();

    // 检查是否是创建者
    const { data: wish } = await client
      .from('wish_dishes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!wish) {
      throw new Error('心愿不存在');
    }

    if (wish.user_id !== userId) {
      throw new Error('无权编辑此心愿');
    }

    const { data, error } = await client
      .from('wish_dishes')
      .update({
        dish_name: updateDto.dish_name,
        description: updateDto.description,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating wish:', error);
      throw new Error('更新心愿失败');
    }

    return data;
  }

  async remove(id: string, userId?: string, isAdmin?: boolean) {
    const client = getSupabaseClient();

    // 如果不是管理员，检查是否是创建者
    if (!isAdmin && userId) {
      const { data: wish } = await client
        .from('wish_dishes')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!wish || wish.user_id !== userId) {
        throw new Error('无权删除此心愿');
      }
    }

    // 先删除投票记录
    await client
      .from('wish_votes')
      .delete()
      .eq('wish_id', id);

    // 再删除心愿
    const { error } = await client
      .from('wish_dishes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wish:', error);
      throw new Error('删除心愿失败');
    }

    return { success: true };
  }
}
