import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Dish {
  id: string
  name: string
  price: number
  image: string | null
  description: string | null
  is_banner: boolean
}

const HomePage = () => {
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    fetchFeaturedDishes()
  })

  const fetchFeaturedDishes = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/dishes',
        method: 'GET'
      })
      console.log('Featured dishes response:', res.data)
      if (res.data && res.data.data) {
        // 获取设置了 is_banner 的菜品
        const allDishes = res.data.data
        const bannerDishes = allDishes.filter((dish: Dish) => dish.is_banner && dish.image)
        setFeaturedDishes(bannerDishes)
      }
    } catch (error) {
      console.error('获取推荐菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartOrder = () => {
    Taro.switchTab({ url: '/pages/menu/index' })
  }

  const handleDishClick = (dishId: string) => {
    Taro.navigateTo({
      url: `/pages/dish-detail/index?id=${dishId}`
    })
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 顶部大图轮播 */}
      <View className="flex-1 relative">
        {loading ? (
          <View className="flex items-center justify-center h-full">
            <Text className="text-gray-500">加载中...</Text>
          </View>
        ) : featuredDishes.length > 0 ? (
          <Swiper
            className="h-full"
            indicatorDots
            autoplay
            interval={4000}
            duration={500}
            indicatorColor="rgba(255, 255, 255, 0.5)"
            indicatorActiveColor="#f97316"
          >
            {featuredDishes.map((dish) => (
              <SwiperItem key={dish.id} onClick={() => handleDishClick(dish.id)}>
                <View className="relative h-full">
                  {dish.image ? (
                    <Image
                      src={dish.image}
                      mode="aspectFill"
                      className="w-full h-full"
                    />
                  ) : (
                    <View className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Text className="text-6xl">🍽️</Text>
                    </View>
                  )}
                  {/* 菜品信息遮罩 */}
                  <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <Text className="text-white text-2xl font-bold mb-2">{dish.name}</Text>
                    {dish.description && (
                      <Text className="text-white/80 text-sm mb-2" numberOfLines={2}>
                        {dish.description}
                      </Text>
                    )}
                    <Text className="text-orange-400 text-xl font-bold">¥{dish.price}</Text>
                  </View>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className="flex flex-col items-center justify-center h-full bg-gray-100">
            <Text className="text-6xl mb-4">🍽️</Text>
            <Text className="text-gray-500">暂无推荐菜品</Text>
          </View>
        )}
      </View>

      {/* 底部开始点菜按钮 */}
      <View className="bg-white p-4 border-t border-gray-200">
        <View
          hoverClass="opacity-80"
          onClick={handleStartOrder}
          className="bg-orange-500 rounded-full py-4 flex items-center justify-center"
        >
          <Text className="text-white text-lg font-semibold">开始点菜</Text>
        </View>
      </View>
    </View>
  )
}

export default HomePage
