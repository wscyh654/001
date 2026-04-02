import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Banner {
  id: string
  title: string | null
  image: string
  link_type: string
  link_id: string | null
}

const HomePage = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    fetchBanners()
  })

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/banners',
        method: 'GET'
      })
      console.log('Banners response:', res.data)
      if (res.data && res.data.data) {
        setBanners(res.data.data)
      }
    } catch (error) {
      console.error('获取轮播图失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartOrder = () => {
    Taro.switchTab({ url: '/pages/menu/index' })
  }

  const handleBannerClick = (banner: Banner) => {
    if (banner.link_type === 'dish' && banner.link_id) {
      Taro.navigateTo({
        url: `/pages/dish-detail/index?id=${banner.link_id}`
      })
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 顶部大图轮播 */}
      <View style={{ height: '42vh', minHeight: '200px', maxHeight: '360px' }}>
        {loading ? (
          <View className="flex items-center justify-center h-full bg-gray-100">
            <Text className="text-gray-500">加载中...</Text>
          </View>
        ) : banners.length > 0 ? (
          <Swiper
            className="h-full"
            indicatorDots
            autoplay
            interval={4000}
            duration={500}
            indicatorColor="rgba(255, 255, 255, 0.5)"
            indicatorActiveColor="#f97316"
          >
            {banners.map((banner) => (
              <SwiperItem key={banner.id} onClick={() => handleBannerClick(banner)}>
                <View className="relative h-full">
                  <Image
                    src={banner.image}
                    mode="aspectFill"
                    className="w-full h-full"
                    style={{ display: 'block' }}
                  />
                  {banner.title && (
                    <View 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        padding: '16px'
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{banner.title}</Text>
                    </View>
                  )}
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className="flex flex-col items-center justify-center h-full bg-gray-100">
            <Text className="text-6xl mb-4">🖼️</Text>
            <Text className="text-gray-500">暂无轮播图</Text>
            <Text className="text-xs text-gray-400 mt-1">请在「我的」页面上传海报图片</Text>
          </View>
        )}
      </View>

      {/* 快捷功能入口 */}
      <View className="bg-white mx-3 mt-3 rounded-xl p-4">
        <View className="flex flex-row justify-around">
          <View 
            className="flex flex-col items-center"
            onClick={handleStartOrder}
          >
            <View className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <Text className="text-2xl">🍽️</Text>
            </View>
            <Text className="text-sm text-gray-700">菜单点餐</Text>
          </View>
          <View 
            className="flex flex-col items-center"
            onClick={() => Taro.switchTab({ url: '/pages/cart/index' })}
          >
            <View className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <Text className="text-2xl">🛒</Text>
            </View>
            <Text className="text-sm text-gray-700">购物车</Text>
          </View>
          <View 
            className="flex flex-col items-center"
            onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}
          >
            <View className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Text className="text-2xl">📋</Text>
            </View>
            <Text className="text-sm text-gray-700">我的订单</Text>
          </View>
        </View>
      </View>

      {/* 底部开始点菜按钮 */}
      <View className="flex-1" />
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
