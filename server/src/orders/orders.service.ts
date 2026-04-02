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
    user_id?: string;
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
        user_id: createOrderDto.user_id || null,
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

  async findAll(userId?: string, isAdmin?: boolean) {
    const client = getSupabaseClient();
    
    // 构建查询
    let query = client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // 如果不是管理员，只查询该用户的订单
    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw new Error('获取订单列表失败');
    }

    // 如果没有订单，直接返回空数组
    if (!orders || orders.length === 0) {
      return [];
    }

    // 获取所有订单明细
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await client
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw new Error('获取订单明细失败');
    }

    // 组装订单数据
    const ordersWithItems = orders.map(order => ({
      ...order,
      total_price: order.total_amount,
      items: (orderItems || [])
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

  async updateStatus(id: string, status: string) {
    const client = getSupabaseClient();

    const { data: order, error } = await client
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error('更新订单状态失败');
    }

    return order;
  }

  async remove(id: string) {
    const client = getSupabaseClient();

    // 先删除订单明细
    const { error: itemsError } = await client
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw new Error('删除订单明细失败');
    }

    // 再删除订单
    const { error: orderError } = await client
      .from('orders')
      .delete()
      .eq('id', id);

    if (orderError) {
      console.error('Error deleting order:', orderError);
      throw new Error('删除订单失败');
    }

    return { success: true };
  }
}
