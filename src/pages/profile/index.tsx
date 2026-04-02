import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Order {
  id: string
  table_number: number
  status: string
  total_price: number
  note: string | null
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  dish_name: string
  quantity: number
  price: number
}

const ProfilePage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchOrders()
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/orders',
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

  const menuItems = [
    { icon: '🖼️', title: '主页图片管理', path: '/pages/home-manage/index' },
    { icon: '🍽️', title: '菜品管理', path: '/pages/dish-manage/index' },
  ]

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1">
        {/* 管理入口 */}
        <View className="bg-white mb-3">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">管理功能</Text>
          </View>
          {menuItems.map((item) => (
            <View
              key={item.path}
              className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-50"
              onClick={() => Taro.navigateTo({ url: item.path })}
            >
              <View className="flex flex-row items-center gap-3">
                <Text className="text-xl">{item.icon}</Text>
                <Text className="text-sm text-gray-700">{item.title}</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </View>
          ))}
        </View>

        {/* 订单需求列表 */}
        <View className="bg-white">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">订单需求</Text>
          </View>
          
          {loading ? (
            <View className="flex items-center justify-center py-8">
              <Text className="text-sm text-gray-500">加载中...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-8">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-sm text-gray-500">暂无订单</Text>
            </View>
          ) : (
            <View>
              {orders.map((order) => (
                <View key={order.id} className="px-4 py-3 border-b border-gray-50">
                  {/* 订单头部 */}
                  <View className="flex flex-row justify-between items-center mb-2">
                    <View className="flex flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-gray-900">
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
                  <View className="mb-2">
                    {order.items.map((item, idx) => (
                      <View key={idx} className="flex flex-row justify-between items-center py-1">
                        <Text className="text-xs text-gray-600">
                          {item.dish_name} × {item.quantity}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          ¥{item.price * item.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* 备注 */}
                  {order.note && (
                    <View className="bg-orange-50 px-2 py-1 rounded mb-2">
                      <Text className="text-xs text-orange-600">备注: {order.note}</Text>
                    </View>
                  )}

                  {/* 总价 */}
                  <View className="flex flex-row justify-between items-center">
                    <Text className="text-xs text-gray-500">
                      共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                    </Text>
                    <Text className="text-sm font-bold text-orange-500">
                      ¥{order.total_price}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfilePage
