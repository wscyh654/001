import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface CartItem {
  dishId: string
  dishName: string
  dishPrice: number
  quantity: number
}

const OrdersPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    const mockCart = [
      { dishId: '1', dishName: '宫保鸡丁', dishPrice: 38, quantity: 2 },
      { dishId: '2', dishName: '麻婆豆腐', dishPrice: 22, quantity: 1 }
    ]
    setCartItems(mockCart)
  })

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.dishPrice * item.quantity, 0)
  }

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (!tableNumber) {
      console.log('请输入桌号')
      return
    }

    if (cartItems.length === 0) {
      console.log('购物车为空')
      return
    }

    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/orders',
        method: 'POST',
        data: {
          table_number: parseInt(tableNumber),
          items: cartItems,
          note: note
        }
      })
      console.log('Order response:', res.data)

      if (res.data && res.data.data) {
        console.log('订单创建成功:', res.data.data)
      }
    } catch (error) {
      console.error('创建订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      <ScrollView scrollY style={{ flex: 1, padding: 12 }}>
        {/* 桌号输入 */}
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, boxSizing: 'border-box' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>桌号</Text>
          <View style={{ backgroundColor: '#f9fafb', borderRadius: 8, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}>
            <Input
              style={{ width: '100%', backgroundColor: 'transparent', fontSize: 13 }}
              placeholder="请输入桌号"
              value={tableNumber}
              onInput={(e) => setTableNumber(e.detail.value)}
              placeholderClass="text-gray-400"
              type="number"
            />
          </View>
        </View>

        {/* 购物车列表 */}
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, boxSizing: 'border-box' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            购物车 ({getTotalQuantity()} 件)
          </Text>
          {cartItems.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 24, paddingBottom: 24 }}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🛒</Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>购物车为空</Text>
            </View>
          ) : (
            <View>
              {cartItems.map((item, index) => (
                <View
                  key={item.dishId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderBottomWidth: index < cartItems.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                    borderBottomStyle: 'solid'
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#111827' }} numberOfLines={1}>
                      {item.dishName}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>
                      ¥{item.dishPrice} × {item.quantity}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#f97316', flexShrink: 0 }}>
                    ¥{item.dishPrice * item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 备注 */}
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, boxSizing: 'border-box' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>备注</Text>
          <View style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: 12 }}>
            <Input
              style={{ width: '100%', backgroundColor: 'transparent', fontSize: 13 }}
              placeholder="请输入备注信息（可选）"
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              placeholderClass="text-gray-400"
              maxlength={200}
            />
          </View>
        </View>

        {/* 总价 */}
        {cartItems.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 64, boxSizing: 'border-box' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>合计</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#f97316' }}>¥{getTotalPrice()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部提交按钮 */}
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
          <View
            hoverClass="opacity-80"
            onClick={loading ? undefined : handleSubmitOrder}
            style={{
              backgroundColor: loading ? '#d1d5db' : '#f97316',
              borderRadius: 8,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              {loading ? '提交中...' : '提交订单'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrdersPage
