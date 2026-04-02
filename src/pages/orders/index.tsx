import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import { getUserId } from '@/utils/user'
import './index.css'

interface OrderItem {
  dish_name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  table_number: number
  status: string
  total_price: number
  note: string | null
  items: OrderItem[]
  created_at: string
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchOrders()
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      const res = await Network.request({
        url: `/api/orders?user_id=${userId}`,
        method: 'GET'
      })
      console.log('Orders response:', res.data)
      if (res.data && res.data.data) {
        setOrders(res.data.data)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': '待处理',
      'preparing': '制作中',
      'ready': '已出餐',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'preparing': '#3b82f6',
      'ready': '#10b981',
      'completed': '#6b7280',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hour}:${minute}`
  }

  const handleAddMore = () => {
    Taro.switchTab({ url: '/pages/menu/index' })
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-3">
        {loading ? (
          <View className="flex items-center justify-center py-12">
            <Text className="text-gray-500">加载中...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-gray-500 mb-4">暂无订单</Text>
            <View
              className="bg-orange-500 rounded-lg px-6 py-2"
              onClick={handleAddMore}
            >
              <Text className="text-white font-semibold">去点菜</Text>
            </View>
          </View>
        ) : (
          <View>
            {orders.map((order) => (
              <View key={order.id} className="bg-white rounded-xl p-3 mb-3">
                {/* 订单头部 */}
                <View className="flex flex-row justify-between items-center mb-3">
                  <View className="flex flex-row items-center gap-2">
                    <Text className="text-base font-bold text-gray-900">
                      桌号: {order.table_number}
                    </Text>
                    <View 
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                    >
                      <Text 
                        className="text-xs font-medium"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-400">
                    {formatTime(order.created_at)}
                  </Text>
                </View>

                {/* 订单商品 */}
                <View className="border-t border-gray-100 pt-3">
                  {order.items.map((item, idx) => (
                    <View key={idx} className="flex flex-row justify-between items-center py-1">
                      <Text className="text-sm text-gray-700">
                        {item.dish_name} × {item.quantity}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        ¥{item.price * item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* 备注 */}
                {order.note && (
                  <View className="bg-orange-50 px-3 py-2 rounded-lg mt-3">
                    <Text className="text-xs text-orange-600">备注: {order.note}</Text>
                  </View>
                )}

                {/* 总价 */}
                <View className="flex flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-sm text-gray-500">
                    共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                  </Text>
                  <Text className="text-lg font-bold text-orange-500">
                    ¥{order.total_price}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部加菜按钮 */}
      {orders.length > 0 && (
        <View className="bg-white border-t border-gray-200 p-3">
          <View
            hoverClass="opacity-80"
            onClick={handleAddMore}
            className="bg-orange-500 rounded-full py-3 flex items-center justify-center"
          >
            <Text className="text-white font-semibold">我要加菜</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrdersPage
