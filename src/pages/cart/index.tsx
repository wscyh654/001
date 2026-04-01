import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface CartItem {
  id: string
  dish_id: string
  dish_name: string
  price: number
  quantity: number
  specs: Record<string, any>
  created_at: string
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchCartItems()
  })

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/cart',
        method: 'GET'
      })
      console.log('Cart items response:', res.data)
      if (res.data && res.data.data) {
        setCartItems(res.data.data)
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const res = await Network.request({
        url: `/api/cart/${itemId}`,
        method: 'PUT',
        data: { quantity: newQuantity }
      })
      
      if (res.data && res.data.code === 200) {
        fetchCartItems()
      }
    } catch (error) {
      console.error('更新数量失败:', error)
      Taro.showToast({ title: '更新失败', icon: 'none' })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await Network.request({
        url: `/api/cart/${itemId}`,
        method: 'DELETE'
      })
      
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchCartItems()
      }
    } catch (error) {
      console.error('删除失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Taro.showToast({ title: '购物车为空', icon: 'none' })
      return
    }

    try {
      const res = await Network.request({
        url: '/api/orders',
        method: 'POST',
        data: {
          items: cartItems.map(item => ({
            dishId: item.dish_id,
            dishName: item.dish_name,
            price: item.price,
            quantity: item.quantity,
            specs: item.specs
          }))
        }
      })
      
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '下单成功', icon: 'success' })
        fetchCartItems()
      }
    } catch (error) {
      console.error('下单失败:', error)
      Taro.showToast({ title: '下单失败', icon: 'none' })
    }
  }

  const getSpecsText = (specs: Record<string, any>) => {
    if (!specs) return ''
    return Object.entries(specs)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ')
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-4">
        {loading ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-base text-gray-500">加载中...</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Text className="text-3xl">🛒</Text>
            </View>
            <Text className="block text-base text-gray-500 mb-4">购物车为空</Text>
            <View
              onClick={() => Taro.switchTab({ url: '/pages/menu/index' })}
              className="bg-orange-500 text-white rounded-lg py-2 px-6"
            >
              <Text className="block text-center font-semibold text-sm">去点菜</Text>
            </View>
          </View>
        ) : (
          <View className="space-y-3">
            {cartItems.map((item) => (
              <View key={item.id} className="bg-white rounded-xl shadow-sm p-4">
                <View className="flex justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="block text-base font-semibold text-gray-900">
                      {item.dish_name}
                    </Text>
                    <Text className="block text-sm text-gray-500 mt-1">
                      {getSpecsText(item.specs)}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-orange-500">
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                <View className="flex justify-between items-center mt-3">
                  <Text className="text-sm text-gray-600">¥{item.price}</Text>
                  
                  <View className="flex items-center gap-3">
                    {/* 数量控制 */}
                    <View className="flex items-center gap-2">
                      <View
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <Text className="text-lg text-gray-600">-</Text>
                      </View>
                      <Text className="text-base font-semibold text-gray-900 min-w-20 text-center">
                        {item.quantity}
                      </Text>
                      <View
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center"
                      >
                        <Text className="text-lg text-orange-600">+</Text>
                      </View>
                    </View>

                    {/* 删除按钮 */}
                    <View
                      onClick={() => handleDeleteItem(item.id)}
                      className="ml-2 px-3 py-1 rounded bg-red-50"
                    >
                      <Text className="text-sm text-red-500">删除</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部结算栏 */}
      {cartItems.length > 0 && (
        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <View className="flex justify-between items-center">
            <View>
              <Text className="block text-sm text-gray-500">
                共 {cartItems.reduce((sum, item) => sum + item.quantity, 0)} 件
              </Text>
              <Text className="text-2xl font-bold text-orange-500">
                ¥{calculateTotal().toFixed(2)}
              </Text>
            </View>
            <View
              onClick={handleCheckout}
              className="bg-orange-500 text-white rounded-lg py-3 px-8"
            >
              <Text className="block text-center font-semibold text-base">去结算</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default CartPage