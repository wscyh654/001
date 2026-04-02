import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface BannerDish {
  id: string
  name: string
  price: number
  image: string | null
  is_banner: boolean
}

const HomeManagePage = () => {
  const [dishes, setDishes] = useState<BannerDish[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
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
        setDishes(res.data.data.filter((dish: BannerDish) => dish.image))
      }
    } catch (error) {
      console.error('获取菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBanner = async (dishId: string, currentStatus: boolean) => {
    try {
      const res = await Network.request({
        url: `/api/dishes/${dishId}`,
        method: 'PUT',
        data: { is_banner: !currentStatus }
      })
      
      if (res.data && res.data.code === 200) {
        Taro.showToast({ 
          title: !currentStatus ? '已添加到主页轮播' : '已从主页轮播移除', 
          icon: 'success' 
        })
        fetchDishes()
      }
    } catch (error) {
      console.error('更新失败:', error)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-3">
        {/* 说明 */}
        <View className="bg-orange-50 rounded-xl p-3 mb-3">
          <Text className="text-sm text-orange-600">
            💡 选择要在主页轮播展示的菜品图片，勾选的菜品将会在小程序首页的大图轮播中展示。
          </Text>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-12">
            <Text className="text-gray-500">加载中...</Text>
          </View>
        ) : dishes.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-4xl mb-3">🖼️</Text>
            <Text className="text-gray-500">暂有可用的菜品图片</Text>
            <Text className="text-xs text-gray-400 mt-1">请先在菜品管理中上传菜品图片</Text>
          </View>
        ) : (
          <View>
            {dishes.map((dish) => (
              <View
                key={dish.id}
                className="bg-white rounded-xl p-3 mb-3 flex flex-row gap-3"
              >
                {/* 菜品图片 */}
                <View className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {dish.image ? (
                    <Image
                      src={dish.image}
                      mode="aspectFill"
                      className="w-full h-full"
                    />
                  ) : (
                    <View className="w-full h-full flex items-center justify-center">
                      <Text className="text-2xl">🍽️</Text>
                    </View>
                  )}
                </View>

                {/* 菜品信息 */}
                <View className="flex-1 flex flex-col justify-between min-w-0">
                  <View>
                    <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text className="text-sm text-orange-500 font-bold mt-1">
                      ¥{dish.price}
                    </Text>
                  </View>

                  {/* 开关按钮 */}
                  <View
                    className={`self-start px-3 py-1.5 rounded-full ${
                      dish.is_banner ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                    onClick={() => handleToggleBanner(dish.id, dish.is_banner)}
                  >
                    <Text className={`text-xs font-medium ${dish.is_banner ? 'text-white' : 'text-gray-600'}`}>
                      {dish.is_banner ? '✓ 已选' : '选择'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default HomeManagePage
