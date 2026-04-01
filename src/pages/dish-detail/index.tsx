import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface DishDetail {
  id: string
  name: string
  category: string
  cuisine_type: string | null
  cooking_method: string | null
  price: number
  image: string | null
  images: string[] | null
  description: string | null
  stock: number
  spiciness: string | null
  temperature: string | null
  specifications: any
  is_available: boolean
}

interface Spec {
  name: string
  options: Array<{ name: string; price: number }>
  isRequired: boolean
}

const DishDetailPage = () => {
  const router = useRouter()
  const [dish, setDish] = useState<DishDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({})
  const [selectedSpiciness, setSelectedSpiciness] = useState<string>('')
  const [selectedTemperature, setSelectedTemperature] = useState<string>('')

  useLoad(() => {
    const { id } = router.params
    if (id) {
      fetchDishDetail(id)
    }
  })

  const fetchDishDetail = async (id: string) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: `/api/dishes/${id}`,
        method: 'GET'
      })
      console.log('Dish detail response:', res.data)
      if (res.data && res.data.data) {
        const dishData = res.data.data
        setDish(dishData)
        // 初始化默认值
        if (dishData.spiciness) {
          setSelectedSpiciness(dishData.spiciness)
        }
        if (dishData.temperature) {
          setSelectedTemperature(dishData.temperature)
        }
      }
    } catch (error) {
      console.error('获取菜品详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSpicinessOptions = () => [
    { value: 'none', label: '不辣' },
    { value: 'mild', label: '微辣' },
    { value: 'medium', label: '中辣' },
    { value: 'hot', label: '特辣' }
  ]

  const getTemperatureOptions = () => [
    { value: 'hot', label: '热' },
    { value: 'normal', label: '常温' },
    { value: 'cold', label: '冰' }
  ]

  const calculateTotalPrice = () => {
    if (!dish) return 0
    let total = dish.price
    
    // 加上规格差价
    if (dish.specifications && Array.isArray(dish.specifications)) {
      dish.specifications.forEach((spec: Spec) => {
        const selected = selectedSpecs[spec.name]
        if (selected) {
          const option = spec.options.find(opt => opt.name === selected)
          if (option) {
            total += option.price
          }
        }
      })
    }
    
    return total * quantity
  }

  const handleAddToCart = async () => {
    if (!dish) return
    
    // 检查必选规格
    if (dish.specifications && Array.isArray(dish.specifications)) {
      for (const spec of dish.specifications) {
        if (spec.isRequired && !selectedSpecs[spec.name]) {
          Taro.showToast({ title: `请选择${spec.name}`, icon: 'none' })
          return
        }
      }
    }

    try {
      const res = await Network.request({
        url: '/api/cart',
        method: 'POST',
        data: {
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: quantity,
          specs: {
            ...selectedSpecs,
            spiciness: selectedSpiciness,
            temperature: selectedTemperature
          }
        }
      })
      
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已加入购物车', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加入购物车失败:', error)
      Taro.showToast({ title: '加入购物车失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className="flex flex-col items-center justify-center h-full">
        <Text className="text-base text-gray-500">加载中...</Text>
      </View>
    )
  }

  if (!dish) {
    return (
      <View className="flex flex-col items-center justify-center h-full">
        <Text className="text-base text-gray-500">菜品不存在</Text>
      </View>
    )
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1">
        {/* 菜品图片 */}
        <View className="w-full h-64 bg-gray-100">
          {dish.image ? (
            <Image
              src={dish.image}
              className="w-full h-full"
              mode="aspectFill"
            />
          ) : (
            <View className="w-full h-full flex items-center justify-center">
              <Text className="text-6xl">🍜</Text>
            </View>
          )}
        </View>

        <View className="bg-white p-4 mb-2">
          {/* 基本信息 */}
          <View className="flex items-center gap-2 mb-2">
            <Text className="text-xl font-bold text-gray-900">{dish.name}</Text>
            {dish.cuisine_type && (
              <View className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs">
                <Text className="text-xs">{dish.cuisine_type}</Text>
              </View>
            )}
            {dish.cooking_method && (
              <View className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                <Text className="text-xs">{dish.cooking_method}</Text>
              </View>
            )}
          </View>

          <View className="flex items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-orange-500">¥{dish.price}</Text>
            <Text className="text-sm text-gray-500">库存: {dish.stock}份</Text>
          </View>

          {dish.description && (
            <Text className="text-sm text-gray-600 leading-relaxed">{dish.description}</Text>
          )}
        </View>

        {/* 辣度选择 */}
        {dish.spiciness && (
          <View className="bg-white p-4 mb-2">
            <Text className="block text-base font-semibold text-gray-900 mb-3">辣度</Text>
            <View className="flex flex-wrap gap-2">
              {getSpicinessOptions().map((option) => {
                const isSelected = selectedSpiciness === option.value
                return (
                  <View
                    key={option.value}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('选择辣度:', option.value)
                      setSelectedSpiciness(option.value)
                    }}
                  >
                    <Text className={`text-sm ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
                      {option.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 温度选择 */}
        {dish.temperature && (
          <View className="bg-white p-4 mb-2">
            <Text className="block text-base font-semibold text-gray-900 mb-3">温度</Text>
            <View className="flex flex-wrap gap-2">
              {getTemperatureOptions().map((option) => {
                const isSelected = selectedTemperature === option.value
                return (
                  <View
                    key={option.value}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('选择温度:', option.value)
                      setSelectedTemperature(option.value)
                    }}
                  >
                    <Text className={`text-sm ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
                      {option.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 规格选择 */}
        {dish.specifications && Array.isArray(dish.specifications) && dish.specifications.length > 0 && (
          <View className="bg-white p-4 mb-2">
            {dish.specifications.map((spec: Spec, specIndex: number) => (
              <View key={specIndex} className="mb-4 last:mb-0">
                <View className="flex items-center gap-2 mb-3">
                  <Text className="block text-base font-semibold text-gray-900">
                    {spec.name}
                  </Text>
                  {spec.isRequired && (
                    <View className="bg-red-100 px-2 py-0.5 rounded">
                      <Text className="text-xs text-red-600">必选</Text>
                    </View>
                  )}
                </View>
                <View className="flex flex-wrap gap-2">
                  {spec.options.map((option, optIndex: number) => {
                    const isSelected = selectedSpecs[spec.name] === option.name
                    return (
                      <View
                        key={optIndex}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('选择规格:', spec.name, option.name)
                          setSelectedSpecs({
                            ...selectedSpecs,
                            [spec.name]: option.name
                          })
                        }}
                      >
                        <Text className={`text-sm ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
                          {option.name} {option.price > 0 ? `+¥${option.price}` : ''}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 数量选择 */}
        <View className="bg-white p-4 mb-2">
          <Text className="block text-base font-semibold text-gray-900 mb-3">数量</Text>
          <View className="flex items-center gap-4">
            <View
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                quantity > 1 ? 'bg-orange-100' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-xl ${quantity > 1 ? 'text-orange-600' : 'text-gray-400'}`}>-</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900">{quantity}</Text>
            <View
              onClick={() => quantity < dish.stock && setQuantity(quantity + 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                quantity < dish.stock ? 'bg-orange-100' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-xl ${quantity < dish.stock ? 'text-orange-600' : 'text-gray-400'}`}>+</Text>
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <View className="flex justify-between items-center">
          <View>
            <Text className="block text-sm text-gray-500">合计</Text>
            <Text className="text-2xl font-bold text-orange-500">¥{calculateTotalPrice()}</Text>
          </View>
          <View
            onClick={handleAddToCart}
            className="bg-orange-500 text-white rounded-lg py-3 px-8"
          >
            <Text className="block text-center font-semibold text-base">加入购物车</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default DishDetailPage