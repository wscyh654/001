import { View, Text, ScrollView, Input, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { isAdmin, setAdminStatus, clearAdminStatus, getUserId } from '@/utils/user'
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

interface Wish {
  id: string
  user_id: string | null
  dish_name: string
  description: string | null
  vote_count: number
  created_at: string
}

const ADMIN_PASSWORD = 'admin123' // 简单的管理员密码

const ProfilePage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  
  // 我想吃相关状态
  const [wishes, setWishes] = useState<Wish[]>([])
  const [showAddWish, setShowAddWish] = useState(false)
  const [newWishName, setNewWishName] = useState('')
  const [newWishDesc, setNewWishDesc] = useState('')
  const [editingWish, setEditingWish] = useState<Wish | null>(null)
  const [editWishName, setEditWishName] = useState('')
  const [editWishDesc, setEditWishDesc] = useState('')

  useDidShow(() => {
    // 检查是否已经是管理员
    const adminStatus = isAdmin()
    setIsAdminMode(adminStatus)
    if (adminStatus) {
      fetchOrders(true)
    } else {
      setLoading(false)
    }
    fetchWishes()
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

  const fetchWishes = async () => {
    try {
      const res = await Network.request({
        url: '/api/wish',
        method: 'GET'
      })
      if (res.data && res.data.data) {
        setWishes(res.data.data)
      }
    } catch (error) {
      console.error('获取心愿列表失败:', error)
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



  // 我想吃相关方法
  const handleAddWish = async () => {
    if (!newWishName.trim()) {
      Taro.showToast({ title: '请输入菜品名称', icon: 'none' })
      return
    }

    try {
      const userId = getUserId()
      const res = await Network.request({
        url: '/api/wish',
        method: 'POST',
        data: {
          dish_name: newWishName.trim(),
          description: newWishDesc.trim() || null,
          user_id: userId
        }
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '心愿已提交', icon: 'success' })
        setNewWishName('')
        setNewWishDesc('')
        setShowAddWish(false)
        fetchWishes()
      }
    } catch (error) {
      console.error('提交心愿失败:', error)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
  }

  const handleVoteWish = async (wishId: string) => {
    try {
      const userId = getUserId()
      const res = await Network.request({
        url: `/api/wish/${wishId}/vote`,
        method: 'POST',
        data: { user_id: userId }
      })
      if (res.data && res.data.code === 200) {
        fetchWishes()
      }
    } catch (error) {
      console.error('投票失败:', error)
      Taro.showToast({ title: '投票失败', icon: 'none' })
    }
  }

  const handleDeleteWish = async (wishId: string) => {
    const result = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个心愿吗？'
    })
    if (!result.confirm) return

    try {
      const userId = getUserId()
      const res = await Network.request({
        url: `/api/wish/${wishId}`,
        method: 'DELETE',
        data: { user_id: userId, is_admin: isAdminMode }
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchWishes()
      }
    } catch (error) {
      console.error('删除心愿失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  const handleEditWish = (wish: Wish) => {
    setEditingWish(wish)
    setEditWishName(wish.dish_name)
    setEditWishDesc(wish.description || '')
  }

  const handleUpdateWish = async () => {
    if (!editingWish) return
    if (!editWishName.trim()) {
      Taro.showToast({ title: '请输入菜品名称', icon: 'none' })
      return
    }

    try {
      const userId = getUserId()
      const res = await Network.request({
        url: `/api/wish/${editingWish.id}`,
        method: 'PUT',
        data: {
          dish_name: editWishName.trim(),
          description: editWishDesc.trim() || null,
          user_id: userId
        }
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已更新', icon: 'success' })
        setEditingWish(null)
        setEditWishName('')
        setEditWishDesc('')
        fetchWishes()
      }
    } catch (error) {
      console.error('更新心愿失败:', error)
      Taro.showToast({ title: '更新失败', icon: 'none' })
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

        {/* 我想吃板块 */}
        <View className="bg-white mb-3">
          <View className="px-4 py-3 border-b border-gray-100 flex flex-row justify-between items-center">
            <Text className="text-sm font-semibold text-gray-900">我想吃</Text>
            <View
              className="bg-orange-500 rounded-full px-3 py-1"
              onClick={() => setShowAddWish(true)}
            >
              <Text className="text-xs text-white">+ 许愿</Text>
            </View>
          </View>
          
          {/* 添加心愿表单 */}
          {showAddWish && (
            <View className="px-4 py-3 border-b border-gray-100 bg-orange-50">
              <View className="mb-3">
                <Text className="text-xs text-gray-600 mb-1">菜品名称</Text>
                <View className="bg-white rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm"
                    placeholder="想吃什么菜？"
                    value={newWishName}
                    onInput={(e) => setNewWishName(e.detail.value)}
                  />
                </View>
              </View>
              <View className="mb-3">
                <Text className="text-xs text-gray-600 mb-1">描述（选填）</Text>
                <View className="bg-white rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm"
                    placeholder="说说你的想法..."
                    value={newWishDesc}
                    onInput={(e) => setNewWishDesc(e.detail.value)}
                  />
                </View>
              </View>
              <View className="flex flex-row gap-2">
                <View
                  className="flex-1 bg-gray-200 rounded-full py-2 items-center"
                  onClick={() => { setShowAddWish(false); setNewWishName(''); setNewWishDesc('') }}
                >
                  <Text className="text-sm text-gray-600">取消</Text>
                </View>
                <View
                  className="flex-1 bg-orange-500 rounded-full py-2 items-center"
                  onClick={handleAddWish}
                >
                  <Text className="text-sm text-white font-semibold">提交</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* 心愿列表 */}
          {wishes.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="text-3xl mb-2">💡</Text>
              <Text className="text-sm text-gray-500">还没有人许愿，快来第一个许愿吧！</Text>
            </View>
          ) : (
            <View>
              {wishes.map((wish) => {
                const currentUserId = getUserId()
                const isOwner = wish.user_id === currentUserId
                const canManage = isOwner || isAdminMode
                
                return (
                  <View key={wish.id} className="px-4 py-3 border-b border-gray-50">
                    <View className="flex flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-sm font-semibold text-gray-900">{wish.dish_name}</Text>
                        {wish.description && (
                          <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>{wish.description}</Text>
                        )}
                      </View>
                      <View className="flex flex-row items-center gap-2">
                        <View
                          className="flex flex-row items-center gap-1 bg-orange-50 rounded-full px-3 py-1"
                          onClick={() => handleVoteWish(wish.id)}
                        >
                          <Text className="text-sm">👍</Text>
                          <Text className="text-sm text-orange-600 font-semibold">{wish.vote_count}</Text>
                        </View>
                      </View>
                    </View>
                    {canManage && (
                      <View className="flex flex-row justify-end gap-2 mt-2">
                        <View
                          className="px-3 py-1 rounded-full bg-blue-50"
                          onClick={() => handleEditWish(wish)}
                        >
                          <Text className="text-xs text-blue-500">编辑</Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full bg-red-50"
                          onClick={() => handleDeleteWish(wish.id)}
                        >
                          <Text className="text-xs text-red-500">删除</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          )}
          
          {/* 编辑心愿弹窗 */}
          {editingWish && (
            <View className="px-4 py-3 border-b border-gray-100 bg-blue-50">
              <Text className="text-sm font-semibold text-gray-900 mb-3">编辑心愿</Text>
              <View className="mb-3">
                <Text className="text-xs text-gray-600 mb-1">菜品名称</Text>
                <View className="bg-white rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm"
                    placeholder="菜品名称"
                    value={editWishName}
                    onInput={(e) => setEditWishName(e.detail.value)}
                  />
                </View>
              </View>
              <View className="mb-3">
                <Text className="text-xs text-gray-600 mb-1">描述（选填）</Text>
                <View className="bg-white rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm"
                    placeholder="描述..."
                    value={editWishDesc}
                    onInput={(e) => setEditWishDesc(e.detail.value)}
                  />
                </View>
              </View>
              <View className="flex flex-row gap-2">
                <View
                  className="flex-1 bg-gray-200 rounded-full py-2 items-center"
                  onClick={() => { setEditingWish(null); setEditWishName(''); setEditWishDesc('') }}
                >
                  <Text className="text-sm text-gray-600">取消</Text>
                </View>
                <View
                  className="flex-1 bg-blue-500 rounded-full py-2 items-center"
                  onClick={handleUpdateWish}
                >
                  <Text className="text-sm text-white font-semibold">保存</Text>
                </View>
              </View>
            </View>
          )}
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
                    <View className="flex flex-row items-center gap-2 mb-2">
                      <View className="bg-orange-50 px-3 py-1.5 rounded-full">
                        <Text className="text-xs text-orange-600">备注: {order.note}</Text>
                      </View>
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
