import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Dish {
  id: string
  name: string
  category: string
  price: number
  image: string | null
  description: string | null
  is_available: boolean
}

const CATEGORIES = ['全部', '热菜', '凉菜', '饮品', '主食']

const MenuPage = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  useLoad(() => {
    fetchDishes()
  })

  const fetchDishes = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/dishes',
        method: 'GET'
      })
      console.log('Dishes response:', res.data)
      if (res.data && res.data.data) {
        setDishes(res.data.data)
      }
    } catch (error) {
      console.error('获取菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes = selectedCategory === '全部'
    ? dishes
    : dishes.filter(dish => dish.category === selectedCategory)

  const addToCart = (dishId: string) => {
    setCart(prev => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1
    }))
  }

  const getTotalQuantity = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 分类选择 */}
      <ScrollView scrollX className="bg-white border-b border-gray-200">
        <View className="flex flex-row p-4 gap-3">
          {CATEGORIES.map((category) => (
            <View
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-orange-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {category}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 菜品列表 */}
      <ScrollView scrollY className="flex-1 p-4">
        {loading ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-base text-gray-500">加载中...</Text>
          </View>
        ) : filteredDishes.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Text className="text-3xl">🍽️</Text>
            </View>
            <Text className="block text-base text-gray-500">暂无菜品</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredDishes.map((dish) => (
              <View key={dish.id} className="bg-white rounded-xl shadow-sm p-4">
                <View className="flex flex-row gap-4">
                  <View className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                    {dish.image ? (
                      <Image
                        src={dish.image}
                        className="w-full h-full rounded-lg"
                        mode="aspectFill"
                      />
                    ) : (
                      <View className="w-full h-full flex items-center justify-center">
                        <Text className="text-4xl">🍜</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-1 flex flex-col justify-between">
                    <View>
                      <Text className="block text-base font-semibold text-gray-900 mb-1">
                        {dish.name}
                      </Text>
                      {dish.description && (
                        <Text className="block text-sm text-gray-500 mb-2">
                          {dish.description}
                        </Text>
                      )}
                    </View>
                    <View className="flex justify-between items-center">
                      <Text className="text-lg font-bold text-orange-500">
                        ¥{dish.price}
                      </Text>
                      <View
                        onClick={() => addToCart(dish.id)}
                        className="bg-orange-500 text-white rounded-lg py-2 px-4"
                      >
                        <Text className="block text-center font-semibold text-sm">
                          加入购物车
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 购物车提示 */}
      {getTotalQuantity() > 0 && (
        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <View className="flex justify-between items-center">
            <View>
              <Text className="block text-base font-semibold text-gray-900">
                已选 {getTotalQuantity()} 件
              </Text>
            </View>
            <View
              onClick={() => {
                // TODO: 跳转到订单页面
                console.log('跳转到订单页面')
              }}
              className="bg-orange-500 text-white rounded-lg py-2 px-6"
            >
              <Text className="block text-center font-semibold text-base">
                去结算
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default MenuPage
