import { View, Text, ScrollView, Input, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { isAdmin, setAdminStatus, clearAdminStatus } from '@/utils/user'
import './index.css'

interface Order {
  id: string
  table_number: number
  status: string
  total_price: number
  note: string | null
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  dish_name: string
  quantity: number
  price: number
}

const ADMIN_PASSWORD = 'admin123' // 简单的管理员密码

const ProfilePage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useDidShow(() => {
    // 检查是否已经是管理员
    const adminStatus = isAdmin()
    setIsAdminMode(adminStatus)
    if (adminStatus) {
      fetchOrders(true)
    } else {
      setLoading(false)
    }
  })

  useEffect(() => {
    // 生成二维码 URL（使用第三方 API 生成二维码）
    // 实际生产环境应该使用微信小程序码 API
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : ''
    if (currentUrl) {
      // 使用 QRServer API 生成二维码
      const encodedUrl = encodeURIComponent(currentUrl)
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`)
    }
  }, [])

  const fetchOrders = async (adminMode: boolean) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: `/api/orders?is_admin=${adminMode}`,
        method: 'GET'
      })
      console.log('Orders response:', res.data)
      if (res.data && res.data.data) {
        setOrders(res.data.data)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminStatus(true)
      setIsAdminMode(true)
      setShowPasswordInput(false)
      setPassword('')
      Taro.showToast({ title: '管理员登录成功', icon: 'success' })
      fetchOrders(true)
    } else {
      Taro.showToast({ title: '密码错误', icon: 'none' })
    }
  }

  const handleLogout = () => {
    clearAdminStatus()
    setIsAdminMode(false)
    setOrders([])
    Taro.showToast({ title: '已退出管理员模式', icon: 'success' })
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await Network.request({
        url: `/api/orders/${orderId}/status`,
        method: 'PUT',
        data: { status: 'completed' }
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '订单已完成', icon: 'success' })
        fetchOrders(true)
      }
    } catch (error) {
      console.error('完成订单失败:', error)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    const result = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？'
    })
    if (!result.confirm) return

    try {
      const res = await Network.request({
        url: `/api/orders/${orderId}`,
        method: 'DELETE'
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '订单已删除', icon: 'success' })
        fetchOrders(true)
      }
    } catch (error) {
      console.error('删除订单失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  const handleSaveQrCode = () => {
    if (qrCodeUrl) {
      Taro.showToast({ title: '长按图片保存', icon: 'none' })
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': '待处理',
      'preparing': '制作中',
      'ready': '已出餐',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'preparing': '#3b82f6',
      'ready': '#10b981',
      'completed': '#6b7280',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hour}:${minute}`
  }

  const menuItems = [
    { icon: '🖼️', title: '主页图片管理', path: '/pages/home-manage/index' },
    { icon: '🍽️', title: '菜品管理', path: '/pages/dish-manage/index' },
  ]

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1">
        {/* 扫码点餐 */}
        <View className="bg-white mb-3">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">扫码点餐</Text>
          </View>
          <View className="flex flex-col items-center py-6">
            {qrCodeUrl ? (
              <View 
                className="bg-white p-4 rounded-2xl shadow-sm"
                onClick={handleSaveQrCode}
              >
                <Image
                  src={qrCodeUrl}
                  style={{ width: 180, height: 180 }}
                  mode="aspectFit"
                />
              </View>
            ) : (
              <View className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Text className="text-gray-400">生成中...</Text>
              </View>
            )}
            <Text className="text-sm text-gray-500 mt-4">扫描二维码进入点餐页面</Text>
            <Text className="text-xs text-gray-400 mt-1">长按图片可保存</Text>
          </View>
        </View>

        {/* 管理入口 */}
        <View className="bg-white mb-3">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">管理功能</Text>
          </View>
          {menuItems.map((item) => (
            <View
              key={item.path}
              className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-50"
              onClick={() => Taro.navigateTo({ url: item.path })}
            >
              <View className="flex flex-row items-center gap-3">
                <Text className="text-xl">{item.icon}</Text>
                <Text className="text-sm text-gray-700">{item.title}</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </View>
          ))}
        </View>

        {/* 管理员登录/订单管理 */}
        <View className="bg-white">
          <View className="px-4 py-3 border-b border-gray-100 flex flex-row justify-between items-center">
            <Text className="text-sm font-semibold text-gray-900">订单管理</Text>
            {isAdminMode && (
              <View
                className="px-4 py-1.5 rounded-full bg-gray-100"
                onClick={handleLogout}
              >
                <Text className="text-xs text-gray-600">退出管理</Text>
              </View>
            )}
          </View>
          
          {!isAdminMode ? (
            showPasswordInput ? (
              <View className="p-4">
                <Text className="text-sm text-gray-600 mb-3">请输入管理员密码</Text>
                <View className="flex flex-row gap-2">
                  <View className="flex-1 bg-gray-50 rounded-full px-4 py-2">
                    <Input
                      className="w-full bg-transparent text-sm"
                      password
                      placeholder="输入密码"
                      value={password}
                      onInput={(e) => setPassword(e.detail.value)}
                    />
                  </View>
                  <View
                    className="bg-orange-500 rounded-full px-5 py-2 flex items-center justify-center"
                    onClick={handleAdminLogin}
                  >
                    <Text className="text-white text-sm font-semibold">确认</Text>
                  </View>
                </View>
                <View
                  className="mt-3 px-4 py-2"
                  onClick={() => { setShowPasswordInput(false); setPassword('') }}
                >
                  <Text className="text-sm text-gray-400">取消</Text>
                </View>
              </View>
            ) : (
              <View
                className="px-4 py-4 flex items-center justify-center"
                onClick={() => setShowPasswordInput(true)}
              >
                <View className="bg-orange-500 rounded-full px-6 py-2">
                  <Text className="text-sm text-white font-semibold">进入管理员模式</Text>
                </View>
              </View>
            )
          ) : loading ? (
            <View className="flex items-center justify-center py-8">
              <Text className="text-sm text-gray-500">加载中...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-8">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-sm text-gray-500">暂无订单</Text>
            </View>
          ) : (
            <View>
              {orders.map((order) => (
                <View key={order.id} className="px-4 py-3 border-b border-gray-50">
                  {/* 订单头部 */}
                  <View className="flex flex-row justify-between items-center mb-2">
                    <View className="flex flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-gray-900">
                        桌号: {order.table_number}
                      </Text>
                      <View 
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: getStatusColor(order.status) }}
                        >
                          {getStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-gray-400">
                      {formatTime(order.created_at)}
                    </Text>
                  </View>

                  {/* 订单商品 */}
                  <View className="mb-2">
                    {order.items.map((item, idx) => (
                      <View key={idx} className="flex flex-row justify-between items-center py-1">
                        <Text className="text-xs text-gray-600">
                          {item.dish_name} × {item.quantity}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          ¥{item.price * item.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* 备注 */}
                  {order.note && (
                    <View className="bg-orange-50 px-3 py-1.5 rounded-full mb-2 self-start">
                      <Text className="text-xs text-orange-600">备注: {order.note}</Text>
                    </View>
                  )}

                  {/* 总价和操作 */}
                  <View className="flex flex-row justify-between items-center">
                    <View className="flex flex-row items-center gap-2">
                      <Text className="text-xs text-gray-500">
                        共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                      </Text>
                      <Text className="text-sm font-bold text-orange-500">
                        ¥{order.total_price}
                      </Text>
                    </View>
                    
                    {/* 操作按钮 */}
                    <View className="flex flex-row gap-2">
                      {order.status !== 'completed' && (
                        <View
                          className="px-4 py-1.5 rounded-full bg-green-500"
                          onClick={() => handleCompleteOrder(order.id)}
                        >
                          <Text className="text-xs text-white font-semibold">完成</Text>
                        </View>
                      )}
                      <View
                        className="px-4 py-1.5 rounded-full bg-red-500"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Text className="text-xs text-white font-semibold">删除</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfilePage
