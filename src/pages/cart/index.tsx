import { View, Text, ScrollView, Input } from '@tarojs/components'
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
  note?: string
  created_at: string
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

    if (!tableNumber.trim()) {
      Taro.showToast({ title: '请输入桌号', icon: 'none' })
      return
    }

    try {
      setSubmitting(true)
      const res = await Network.request({
        url: '/api/orders',
        method: 'POST',
        data: {
          table_number: parseInt(tableNumber),
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
        Taro.showToast({ 
          title: '订单已提交，静候美味', 
          icon: 'success',
          duration: 2000
        })
        setTableNumber('')
        fetchCartItems()
        // 跳转到订单页
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/orders/index' })
        }, 1500)
      }
    } catch (error) {
      console.error('下单失败:', error)
      Taro.showToast({ title: '下单失败', icon: 'none' })
    } finally {
      setSubmitting(false)
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
    <View style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      <ScrollView scrollY style={{ flex: 1, padding: 12 }}>
        {loading ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>加载中...</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#f3f4f6', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>🛒</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>购物车为空</Text>
            <View
              onClick={() => Taro.switchTab({ url: '/pages/menu/index' })}
              style={{ backgroundColor: '#f97316', borderRadius: 8, paddingTop: 8, paddingBottom: 8, paddingLeft: 24, paddingRight: 24 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>去点菜</Text>
            </View>
          </View>
        ) : (
          <View>
            {/* 桌号输入 */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, boxSizing: 'border-box' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>桌号</Text>
              <View style={{ backgroundColor: '#f9fafb', borderRadius: 8, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10 }}>
                <Input
                  style={{ width: '100%', backgroundColor: 'transparent', fontSize: 14 }}
                  placeholder="请输入桌号"
                  value={tableNumber}
                  onInput={(e) => setTableNumber(e.detail.value)}
                  type="number"
                />
              </View>
            </View>

            {cartItems.map((item) => (
              <View 
                key={item.id} 
                style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: 12, 
                  padding: 12, 
                  marginBottom: 12,
                  boxSizing: 'border-box'
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }} numberOfLines={1}>
                      {item.dish_name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }} numberOfLines={1}>
                      {getSpecsText(item.specs)}
                    </Text>
                    {item.note && (
                      <View style={{ marginTop: 4, backgroundColor: '#fff7ed', paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                        <Text style={{ fontSize: 11, color: '#ea580c' }}>留言: {item.note}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#f97316', flexShrink: 0 }}>
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ fontSize: 13, color: '#4b5563' }}>¥{item.price}</Text>
                  
                  <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* 数量控制 */}
                    <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <View
                        hoverClass="opacity-70"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontSize: 16, color: '#4b5563' }}>-</Text>
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', width: 24, textAlign: 'center' }}>
                        {item.quantity}
                      </Text>
                      <View
                        hoverClass="opacity-70"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontSize: 16, color: '#ea580c' }}>+</Text>
                      </View>
                    </View>

                    {/* 删除按钮 */}
                    <View
                      hoverClass="opacity-70"
                      onClick={() => handleDeleteItem(item.id)}
                      style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, borderRadius: 4, backgroundColor: '#fef2f2' }}
                    >
                      <Text style={{ fontSize: 12, color: '#ef4444' }}>删除</Text>
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
        <View 
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            borderTopStyle: 'solid',
            padding: 12,
            paddingLeft: 16,
            paddingRight: 16,
            zIndex: 50,
            boxSizing: 'border-box'
          }}
        >
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                共 {cartItems.reduce((sum, item) => sum + item.quantity, 0)} 件
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#f97316' }}>
                ¥{calculateTotal().toFixed(2)}
              </Text>
            </View>
            <View
              hoverClass="opacity-80"
              onClick={submitting ? undefined : handleCheckout}
              style={{ backgroundColor: submitting ? '#d1d5db' : '#f97316', borderRadius: 8, paddingTop: 10, paddingBottom: 10, paddingLeft: 32, paddingRight: 32 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{submitting ? '下单中...' : '去下单'}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default CartPage
