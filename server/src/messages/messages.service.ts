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

  async create(createMessageDto: { content: string }) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('messages')
      .insert({
        content: createMessageDto.content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw new Error('创建留言失败');
    }

    return data;
  }
}
