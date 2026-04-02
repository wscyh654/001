import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Banner {
  id: string
  title: string | null
  image: string
  link_type: string
  link_id: string | null
  sort_order: number
  is_active: boolean
}

const HomeManagePage = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useDidShow(() => {
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

  const handleChooseImage = async () => {
    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album']
      })
      
      if (result.tempFilePaths && result.tempFilePaths.length > 0) {
        await uploadBanner(result.tempFilePaths[0])
      }
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  }

  const uploadBanner = async (filePath: string) => {
    try {
      setUploading(true)
      Taro.showLoading({ title: '上传中...' })
      
      const res = await Network.uploadFile({
        url: '/api/upload',
        filePath: filePath,
        name: 'file'
      })
      
      const data = JSON.parse(res.data)
      console.log('Upload response:', data)
      
      if (data && data.code === 200 && data.data && data.data.url) {
        // 创建轮播图记录
        const createRes = await Network.request({
          url: '/api/banners',
          method: 'POST',
          data: {
            image: data.data.url,
            title: '海报图片',
            sort_order: banners.length
          }
        })
        
        if (createRes.data && createRes.data.code === 200) {
          Taro.showToast({ title: '上传成功', icon: 'success' })
          fetchBanners()
        }
      }
    } catch (error) {
      console.error('上传失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      setUploading(false)
      Taro.hideLoading()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await Network.request({
        url: `/api/banners/${id}`,
        method: 'DELETE'
      })
      
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchBanners()
      }
    } catch (error) {
      console.error('删除失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-3">
        {/* 说明 */}
        <View className="bg-orange-50 rounded-xl p-3 mb-3">
          <Text className="text-sm text-orange-600">
            💡 点击下方按钮从手机相册选择海报图片上传，上传的图片将会在小程序首页的大图轮播中展示。
          </Text>
        </View>

        {/* 上传按钮 */}
        <View
          className={`bg-white rounded-xl p-4 mb-3 flex flex-row items-center justify-center ${uploading ? 'opacity-50' : ''}`}
          onClick={uploading ? undefined : handleChooseImage}
        >
          <Text className="text-2xl mr-2">📷</Text>
          <Text className="text-base text-orange-500 font-semibold">
            {uploading ? '上传中...' : '从相册选择图片上传'}
          </Text>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-12">
            <Text className="text-gray-500">加载中...</Text>
          </View>
        ) : banners.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-4xl mb-3">🖼️</Text>
            <Text className="text-gray-500">暂无轮播图</Text>
            <Text className="text-xs text-gray-400 mt-1">点击上方按钮上传海报图片</Text>
          </View>
        ) : (
          <View>
            <Text className="text-sm text-gray-500 mb-2">已上传的海报图片</Text>
            {banners.map((banner) => (
              <View
                key={banner.id}
                className="bg-white rounded-xl p-3 mb-3"
              >
                <View className="flex flex-row gap-3">
                  {/* 图片预览 */}
                  <View className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={banner.image}
                      mode="aspectFill"
                      className="w-full h-full"
                    />
                  </View>

                  {/* 信息和操作 */}
                  <View className="flex-1 flex flex-col justify-between min-w-0">
                    <View>
                      <Text className="text-sm font-semibold text-gray-900">
                        {banner.title || '海报图片'}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        排序: {banner.sort_order + 1}
                      </Text>
                    </View>

                    {/* 删除按钮 */}
                    <View
                      className="self-start px-3 py-1.5 rounded-full bg-red-50"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Text className="text-xs text-red-500">删除</Text>
                    </View>
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
