import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class CartService {
  // 临时使用一个固定用户ID，实际应该从token中获取
  private tempUserId = 'temp-user-001';

  async findAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('carts')
      .select('*')
      .eq('user_id', this.tempUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart:', error);
      throw new Error('获取购物车失败');
    }

    return data || [];
  }

  async create(createCartDto: {
    dishId: string;
    dishName: string;
    price: number;
    quantity: number;
    specs?: any;
    note?: string;
  }) {
    const client = getSupabaseClient();

    // 检查是否已存在相同菜品和规格（不考虑留言）
    const { data: existingItems } = await client
      .from('carts')
      .select('*')
      .eq('user_id', this.tempUserId)
      .eq('dish_id', createCartDto.dishId);

    // 如果存在相同规格，更新数量
    if (existingItems && existingItems.length > 0) {
      const existingItem = existingItems.find(
        item => JSON.stringify(item.specs) === JSON.stringify(createCartDto.specs)
      );

      if (existingItem && !createCartDto.note) {
        // 只有当没有留言时才合并
        return this.update(existingItem.id, existingItem.quantity + createCartDto.quantity);
      }
    }

    // 创建新项
    const { data, error } = await client
      .from('carts')
      .insert({
        user_id: this.tempUserId,
        dish_id: createCartDto.dishId,
        dish_name: createCartDto.dishName,
        price: createCartDto.price,
        quantity: createCartDto.quantity,
        specs: createCartDto.specs || null,
        note: createCartDto.note || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cart item:', error);
      throw new Error('加入购物车失败');
    }

    return data;
  }

  async update(id: string, quantity: number) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('carts')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      throw new Error('更新购物车失败');
    }

    return data;
  }

  async remove(id: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('carts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing cart item:', error);
      throw new Error('删除购物车项失败');
    }
  }

  async clearAll() {
    const client = getSupabaseClient();
    const { error } = await client
      .from('carts')
      .delete()
      .eq('user_id', this.tempUserId);

    if (error) {
      console.error('Error clearing cart:', error);
      throw new Error('清空购物车失败');
    }
  }
}
