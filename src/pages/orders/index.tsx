import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface CartItem {
  dishId: string
  dishName: string
  dishPrice: number
  quantity: number
}

const OrdersPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    // TODO: 从 Taro.getStorageSync 获取购物车数据
    // 这里暂时使用模拟数据
    const mockCart = [
      { dishId: '1', dishName: '宫保鸡丁', dishPrice: 38, quantity: 2 },
      { dishId: '2', dishName: '麻婆豆腐', dishPrice: 22, quantity: 1 }
    ]
    setCartItems(mockCart)
  })

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.dishPrice * item.quantity, 0)
  }

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (!tableNumber) {
      console.log('请输入桌号')
      return
    }

    if (cartItems.length === 0) {
      console.log('购物车为空')
      return
    }

    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/orders',
        method: 'POST',
        data: {
          table_number: parseInt(tableNumber),
          items: cartItems,
          note: note
        }
      })
      console.log('Order response:', res.data)

      if (res.data && res.data.data) {
        // TODO: 清空购物车
        console.log('订单创建成功:', res.data.data)
        // TODO: 跳转到订单详情页或提示成功
      }
    } catch (error) {
      console.error('创建订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-4">
        {/* 桌号输入 */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="block text-base font-semibold text-gray-900 mb-3">
            桌号
          </Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent text-base"
              placeholder="请输入桌号"
              value={tableNumber}
              onInput={(e) => setTableNumber(e.detail.value)}
              placeholderClass="text-gray-400"
              type="number"
            />
          </View>
        </View>

        {/* 购物车列表 */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="block text-base font-semibold text-gray-900 mb-3">
            购物车 ({getTotalQuantity()} 件)
          </Text>
          {cartItems.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-8">
              <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Text className="text-3xl">🛒</Text>
              </View>
              <Text className="block text-base text-gray-500">购物车为空</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {cartItems.map((item) => (
                <View
                  key={item.dishId}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <View>
                    <Text className="block text-base font-medium text-gray-900">
                      {item.dishName}
                    </Text>
                    <Text className="block text-sm text-gray-500">
                      ¥{item.dishPrice} × {item.quantity}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-orange-500">
                    ¥{item.dishPrice * item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 备注 */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="block text-base font-semibold text-gray-900 mb-3">
            备注
          </Text>
          <View className="bg-gray-50 rounded-xl p-4">
            <Input
              className="w-full bg-transparent text-base"
              placeholder="请输入备注信息（可选）"
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              placeholderClass="text-gray-400"
              maxlength={200}
            />
          </View>
        </View>

        {/* 总价 */}
        {cartItems.length > 0 && (
          <View className="bg-white rounded-xl shadow-sm p-4 mb-20">
            <View className="flex justify-between items-center">
              <Text className="block text-base font-semibold text-gray-900">
                合计
              </Text>
              <Text className="text-2xl font-bold text-orange-500">
                ¥{getTotalPrice()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部提交按钮 */}
      {cartItems.length > 0 && (
        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <View
            onClick={loading ? undefined : handleSubmitOrder}
            className={`${
              loading ? 'bg-gray-300' : 'bg-orange-500'
            } text-white rounded-lg py-3 px-6`}
          >
            <Text className="block text-center font-semibold text-base">
              {loading ? '提交中...' : '提交订单'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrdersPage
