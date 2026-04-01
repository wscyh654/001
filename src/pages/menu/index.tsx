import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Dish {
  id: string
  name: string
  category: string
  cuisine_type: string | null
  cooking_method: string | null
  price: number
  image: string | null
  description: string | null
  stock: number
  spiciness: string | null
  temperature: string | null
  is_new: boolean
  is_available: boolean
}

const CUISINE_TYPES = [
  { key: 'all', label: '全部' },
  { key: '川菜', label: '川菜' },
  { key: '粤菜', label: '粤菜' },
  { key: '家常菜', label: '家常菜' },
  { key: '湘菜', label: '湘菜' },
  { key: '鲁菜', label: '鲁菜' },
]

const COOKING_METHODS = [
  { key: 'all', label: '全部' },
  { key: '炖', label: '炖' },
  { key: '烧', label: '烧' },
  { key: '煮', label: '煮' },
  { key: '蒸', label: '蒸' },
  { key: '炒', label: '炒' },
]

const MenuPage = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [newDishes, setNewDishes] = useState<Dish[]>([])

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
        const allDishes = res.data.data
        setDishes(allDishes)
        // 筛选新品
        setNewDishes(allDishes.filter((dish: Dish) => dish.is_new))
      }
    } catch (error) {
      console.error('获取菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes = dishes.filter(dish => {
    const cuisineMatch = selectedCuisine === 'all' || dish.cuisine_type === selectedCuisine
    const methodMatch = selectedMethod === 'all' || dish.cooking_method === selectedMethod
    return cuisineMatch && methodMatch && dish.is_available
  })

  const getSpicinessLabel = (spiciness: string | null) => {
    const labels: Record<string, string> = {
      'none': '不辣',
      'mild': '微辣',
      'medium': '中辣',
      'hot': '特辣'
    }
    return spiciness ? labels[spiciness] || '' : ''
  }

  const handleDishClick = (dishId: string) => {
    Taro.navigateTo({
      url: `/pages/dish-detail/index?id=${dishId}`
    })
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 顶部管理入口 */}
      <View
        className="bg-orange-500 px-4 py-2 flex items-center justify-between"
        onClick={() => Taro.navigateTo({ url: '/pages/dish-manage/index' })}
      >
        <Text className="text-white text-sm">点击添加新菜品和管理菜品信息</Text>
        <Text className="text-white text-lg">+</Text>
      </View>

      {/* 顶部新品轮播 */}
      {newDishes.length > 0 && (
        <ScrollView scrollX className="bg-white mb-2">
          <View className="flex flex-row p-3 gap-3">
            {newDishes.map((dish) => (
              <View
                key={dish.id}
                className="flex-shrink-0 w-32 bg-orange-50 rounded-xl p-3"
                onClick={() => handleDishClick(dish.id)}
              >
                <View className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  {dish.image ? (
                    <Image
                      src={dish.image}
                      className="w-full h-full rounded-lg"
                      mode="aspectFill"
                    />
                  ) : (
                    <Text className="text-3xl">🍽️</Text>
                  )}
                </View>
                <Text className="block text-sm font-semibold text-gray-900 truncate">
                  {dish.name}
                </Text>
                <View className="flex items-center gap-1 mt-1">
                  <View className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs">
                    <Text className="text-xs">新品</Text>
                  </View>
                  <Text className="text-sm font-bold text-orange-500">¥{dish.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 主体：左侧分类 + 右侧菜品 */}
      <View className="flex flex-1">
        {/* 左侧分类栏 */}
        <ScrollView scrollY className="w-24 bg-white flex-shrink-0">
          <View className="py-2">
            <Text className="block text-xs font-semibold text-gray-500 px-3 py-2">菜系</Text>
            {CUISINE_TYPES.map((item) => (
              <View
                key={item.key}
                onClick={() => setSelectedCuisine(item.key)}
                className={`px-3 py-3 ${
                  selectedCuisine === item.key
                    ? 'bg-orange-50 border-l-2 border-orange-500'
                    : 'border-l-2 border-transparent'
                }`}
              >
                <Text
                  className={`block text-sm ${
                    selectedCuisine === item.key
                      ? 'text-orange-600 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
              </View>
            ))}

            <Text className="block text-xs font-semibold text-gray-500 px-3 py-2 mt-4">烹饪方式</Text>
            {COOKING_METHODS.map((item) => (
              <View
                key={item.key}
                onClick={() => setSelectedMethod(item.key)}
                className={`px-3 py-3 ${
                  selectedMethod === item.key
                    ? 'bg-orange-50 border-l-2 border-orange-500'
                    : 'border-l-2 border-transparent'
                }`}
              >
                <Text
                  className={`block text-sm ${
                    selectedMethod === item.key
                      ? 'text-orange-600 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 右侧菜品列表 */}
        <ScrollView scrollY className="flex-1 p-3">
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
                <View
                  key={dish.id}
                  className="bg-white rounded-xl shadow-sm p-3"
                  onClick={() => handleDishClick(dish.id)}
                >
                  <View className="flex flex-row gap-3">
                    <View className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {dish.image ? (
                        <Image
                          src={dish.image}
                          className="w-full h-full rounded-lg"
                          mode="aspectFill"
                        />
                      ) : (
                        <Text className="text-3xl">🍜</Text>
                      )}
                    </View>
                    <View className="flex-1 flex flex-col justify-between">
                      <View>
                        <View className="flex items-center gap-2 mb-1">
                          <Text className="block text-base font-semibold text-gray-900">
                            {dish.name}
                          </Text>
                          {dish.is_new && (
                            <View className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs">
                              <Text className="text-xs">新品</Text>
                            </View>
                          )}
                        </View>
                        {dish.description && (
                          <Text className="block text-sm text-gray-500 truncate">
                            {dish.description}
                          </Text>
                        )}
                        <View className="flex items-center gap-2 mt-1">
                          {dish.spiciness && dish.spiciness !== 'none' && (
                            <Text className="text-xs text-red-500">
                              🌶️ {getSpicinessLabel(dish.spiciness)}
                            </Text>
                          )}
                          {dish.stock < 10 && (
                            <Text className="text-xs text-orange-500">
                              仅剩{dish.stock}份
                            </Text>
                          )}
                        </View>
                      </View>
                      <View className="flex justify-between items-center">
                        <Text className="text-lg font-bold text-orange-500">
                          ¥{dish.price}
                        </Text>
                        <View
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDishClick(dish.id)
                          }}
                          className="bg-orange-500 text-white rounded-lg py-1.5 px-3"
                        >
                          <Text className="block text-center font-semibold text-xs">
                            选规格
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
      </View>
    </View>
  )
}

export default MenuPage