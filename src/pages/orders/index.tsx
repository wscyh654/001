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
        console.log('订单创建成功:', res.data.data)
      }
    } catch (error) {
      console.error('创建订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-3">
        {/* 桌号输入 */}
        <View className="bg-white rounded-lg p-3 mb-3">
          <Text className="block text-sm font-semibold text-gray-900 mb-2">桌号</Text>
          <View className="bg-gray-50 rounded-lg px-3 py-2">
            <Input
              className="w-full bg-transparent text-sm"
              placeholder="请输入桌号"
              value={tableNumber}
              onInput={(e) => setTableNumber(e.detail.value)}
              placeholderClass="text-gray-400"
              type="number"
            />
          </View>
        </View>

        {/* 购物车列表 */}
        <View className="bg-white rounded-lg p-3 mb-3">
          <Text className="block text-sm font-semibold text-gray-900 mb-2">
            购物车 ({getTotalQuantity()} 件)
          </Text>
          {cartItems.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-6">
              <Text className="text-2xl mb-2">🛒</Text>
              <Text className="block text-sm text-gray-500">购物车为空</Text>
            </View>
          ) : (
            <View>
              {cartItems.map((item, index) => (
                <View
                  key={item.dishId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottomWidth: index < cartItems.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                    borderBottomStyle: 'solid'
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text className="block text-sm font-medium text-gray-900">
                      {item.dishName}
                    </Text>
                    <Text className="block text-xs text-gray-500">
                      ¥{item.dishPrice} × {item.quantity}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-orange-500">
                    ¥{item.dishPrice * item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 备注 */}
        <View className="bg-white rounded-lg p-3 mb-3">
          <Text className="block text-sm font-semibold text-gray-900 mb-2">备注</Text>
          <View className="bg-gray-50 rounded-lg p-3">
            <Input
              className="w-full bg-transparent text-sm"
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
          <View className="bg-white rounded-lg p-3 mb-16">
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text className="block text-sm font-semibold text-gray-900">合计</Text>
              <Text className="text-xl font-bold text-orange-500">¥{getTotalPrice()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部提交按钮 */}
      {cartItems.length > 0 && (
        <View 
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
            borderTopStyle: 'solid',
            padding: 12,
            zIndex: 50
          }}
        >
          <View
            hoverClass="opacity-80"
            onClick={loading ? undefined : handleSubmitOrder}
            style={{
              backgroundColor: loading ? '#d1d5db' : '#f97316',
              borderRadius: 8,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              {loading ? '提交中...' : '提交订单'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrdersPage
