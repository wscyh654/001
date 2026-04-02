import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class OrdersService {
  async create(createOrderDto: {
    table_number?: number;
    items: Array<{
      dishId: string;
      dishName: string;
      price: number;
      quantity: number;
      specs?: any;
    }>;
    note?: string;
  }) {
    const client = getSupabaseClient();

    // 计算总价
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 创建订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        table_number: createOrderDto.table_number || 0,
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
      dish_name: item.dishName,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      specs: item.specs || null,
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

  async findAll() {
    const client = getSupabaseClient();
    
    // 获取所有订单
    const { data: orders, error: ordersError } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw new Error('获取订单列表失败');
    }

    // 获取所有订单明细
    const { data: orderItems, error: itemsError } = await client
      .from('order_items')
      .select('*');

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw new Error('获取订单明细失败');
    }

    // 组装订单数据
    const ordersWithItems = orders.map(order => ({
      ...order,
      total_price: order.total_amount,
      items: orderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          dish_name: item.dish_name,
          quantity: item.quantity,
          price: item.price,
          specs: item.specs,
        })),
    }));

    return ordersWithItems;
  }
}
