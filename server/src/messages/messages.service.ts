import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class MessagesService {
  async findAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error('获取留言列表失败');
    }

    return data || [];
  }

  async create(createMessageDto: { content: string; user_id?: string }) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('messages')
      .insert({
        content: createMessageDto.content,
        user_id: createMessageDto.user_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw new Error('创建留言失败');
    }

    return data;
  }

  async update(id: string, updateDto: { content: string }, userId: string) {
    const client = getSupabaseClient();

    // 检查是否是创建者
    const { data: message } = await client
      .from('messages')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!message) {
      throw new Error('留言不存在');
    }

    if (message.user_id !== userId) {
      throw new Error('无权编辑此留言');
    }

    const { data, error } = await client
      .from('messages')
      .update({ content: updateDto.content })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      throw new Error('更新留言失败');
    }

    return data;
  }

  async remove(id: string, userId?: string, isAdmin?: boolean) {
    const client = getSupabaseClient();

    // 如果不是管理员，检查是否是创建者
    if (!isAdmin && userId) {
      const { data: message } = await client
        .from('messages')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!message || message.user_id !== userId) {
        throw new Error('无权删除此留言');
      }
    }

    const { error } = await client
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      throw new Error('删除留言失败');
    }

    return { success: true };
  }
}
