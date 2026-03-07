import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class OrdersService {
  async create(createOrderDto: {
    table_number: number;
    items: Array<{
      dishId: string;
      dishName: string;
      dishPrice: number;
      quantity: number;
    }>;
    note?: string;
  }) {
    const client = getSupabaseClient();

    // 计算总价
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.dishPrice * item.quantity,
      0,
    );

    // 创建订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        table_number: createOrderDto.table_number,
        total_amount: totalAmount,
        status: 'pending',
        note: createOrderDto.note || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('创建订单失败');
    }

    // 创建订单明细
    const orderItems = createOrderDto.items.map((item) => ({
      order_id: order.id,
      dish_id: item.dishId,
      quantity: item.quantity,
      price: item.dishPrice,
      subtotal: item.dishPrice * item.quantity,
    }));

    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('创建订单明细失败');
    }

    return order;
  }
}
