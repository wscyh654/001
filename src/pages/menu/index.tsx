import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
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

interface CartItem {
  id: string
  dish_id: string
  dish_name: string
  price: number
  quantity: number
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

const STAPLE_FOODS = [
  { key: 'all', label: '全部' },
  { key: '米饭', label: '米饭' },
  { key: '面条', label: '面条' },
  { key: '馒头', label: '馒头' },
  { key: '包子', label: '包子' },
  { key: '饺子', label: '饺子' },
]

const MenuPage = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedStaple, setSelectedStaple] = useState('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useLoad(() => {
    fetchDishes()
  })

  useDidShow(() => {
    fetchCartItems()
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
        setDishes(res.data.data)
      }
    } catch (error) {
      console.error('获取菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartItems = async () => {
    try {
      const res = await Network.request({
        url: '/api/cart',
        method: 'GET'
      })
      if (res.data && res.data.data) {
        setCartItems(res.data.data)
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
    }
  }

  const getCartQuantity = (dishId: string) => {
    const cartItem = cartItems.find(item => item.dish_id === dishId)
    return cartItem ? cartItem.quantity : 0
  }

  const filteredDishes = dishes.filter(dish => {
    const cuisineMatch = selectedCuisine === 'all' || dish.cuisine_type === selectedCuisine
    const methodMatch = selectedMethod === 'all' || dish.cooking_method === selectedMethod
    const stapleMatch = selectedStaple === 'all' || dish.category === selectedStaple
    return cuisineMatch && methodMatch && stapleMatch && dish.is_available
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

  const handleAddToCart = async (dish: Dish, e: any) => {
    e.stopPropagation()
    try {
      const res = await Network.request({
        url: '/api/cart',
        method: 'POST',
        data: {
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: 1,
          specs: {}
        }
      })
      
      if (res.data && res.data.code === 200) {
        await fetchCartItems()
        Taro.showToast({ title: '已加入购物车', icon: 'success', duration: 1000 })
      }
    } catch (error) {
      console.error('加入购物车失败:', error)
      Taro.showToast({ title: '加入失败', icon: 'none' })
    }
  }

  const handleRemoveFromCart = async (dish: Dish, e: any) => {
    e.stopPropagation()
    const cartItem = cartItems.find(item => item.dish_id === dish.id)
    if (!cartItem) return

    try {
      if (cartItem.quantity <= 1) {
        const res = await Network.request({
          url: `/api/cart/${cartItem.id}`,
          method: 'DELETE'
        })
        if (res.data && res.data.code === 200) {
          await fetchCartItems()
        }
      } else {
        const res = await Network.request({
          url: `/api/cart/${cartItem.id}`,
          method: 'PUT',
          data: { quantity: cartItem.quantity - 1 }
        })
        if (res.data && res.data.code === 200) {
          await fetchCartItems()
        }
      }
    } catch (error) {
      console.error('更新购物车失败:', error)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const getTotalCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 主体：左侧分类 + 右侧菜品 */}
      <View className="flex flex-row flex-1 overflow-hidden">
        {/* 左侧分类栏 */}
        <ScrollView scrollY style={{ width: 80, backgroundColor: '#fff', flexShrink: 0 }}>
          <View style={{ paddingTop: 8, paddingBottom: 8 }}>
            {/* 主页入口 */}
            <View
              onClick={() => Taro.navigateTo({ url: '/pages/home/index' })}
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 12,
                paddingBottom: 12,
                backgroundColor: '#fff7ed',
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
                borderBottomStyle: 'solid'
              }}
            >
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 20 }}>🏠</Text>
                <Text style={{ fontSize: 12, color: '#f97316', fontWeight: '600' }}>主页</Text>
              </View>
            </View>
            
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280', paddingLeft: 12, paddingTop: 8, paddingBottom: 8 }}>菜系</Text>
            {CUISINE_TYPES.map((item) => (
              <View
                key={item.key}
                onClick={() => setSelectedCuisine(item.key)}
                style={{
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 12,
                  paddingBottom: 12,
                  backgroundColor: selectedCuisine === item.key ? '#fff7ed' : '#fff',
                  borderLeftWidth: 2,
                  borderLeftColor: selectedCuisine === item.key ? '#f97316' : 'transparent',
                  borderLeftStyle: 'solid'
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: selectedCuisine === item.key ? '#ea580c' : '#374151',
                    fontWeight: selectedCuisine === item.key ? '600' : '400'
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}

            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280', paddingLeft: 12, paddingTop: 16, paddingBottom: 8 }}>烹饪方式</Text>
            {COOKING_METHODS.map((item) => (
              <View
                key={item.key}
                onClick={() => setSelectedMethod(item.key)}
                style={{
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 12,
                  paddingBottom: 12,
                  backgroundColor: selectedMethod === item.key ? '#fff7ed' : '#fff',
                  borderLeftWidth: 2,
                  borderLeftColor: selectedMethod === item.key ? '#f97316' : 'transparent',
                  borderLeftStyle: 'solid'
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: selectedMethod === item.key ? '#ea580c' : '#374151',
                    fontWeight: selectedMethod === item.key ? '600' : '400'
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}

            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280', paddingLeft: 12, paddingTop: 16, paddingBottom: 8 }}>主食</Text>
            {STAPLE_FOODS.map((item) => (
              <View
                key={item.key}
                onClick={() => setSelectedStaple(item.key)}
                style={{
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 12,
                  paddingBottom: 12,
                  backgroundColor: selectedStaple === item.key ? '#fff7ed' : '#fff',
                  borderLeftWidth: 2,
                  borderLeftColor: selectedStaple === item.key ? '#f97316' : 'transparent',
                  borderLeftStyle: 'solid'
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: selectedStaple === item.key ? '#ea580c' : '#374151',
                    fontWeight: selectedStaple === item.key ? '600' : '400'
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 右侧菜品列表 */}
        <ScrollView scrollY style={{ flex: 1, padding: 12, boxSizing: 'border-box' }}>
          {loading ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>加载中...</Text>
            </View>
          ) : filteredDishes.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
              <View style={{ width: 64, height: 64, backgroundColor: '#f3f4f6', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 28 }}>🍽️</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>暂无菜品</Text>
            </View>
          ) : (
            <View>
              {filteredDishes.map((dish) => {
                const quantity = getCartQuantity(dish.id)
                return (
                  <View
                    key={dish.id}
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 12, 
                      padding: 12, 
                      marginBottom: 12,
                      boxSizing: 'border-box'
                    }}
                    onClick={() => handleDishClick(dish.id)}
                  >
                    <View style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                      <View style={{ width: 80, height: 80, backgroundColor: '#f3f4f6', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {dish.image ? (
                          <Image
                            src={dish.image}
                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                            mode="aspectFill"
                          />
                        ) : (
                          <Text style={{ fontSize: 28 }}>🍜</Text>
                        )}
                      </View>
                      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <View>
                          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }} numberOfLines={1}>
                              {dish.name}
                            </Text>
                            {dish.is_new && (
                              <View style={{ backgroundColor: '#f97316', paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 11, color: '#fff' }}>新品</Text>
                              </View>
                            )}
                          </View>
                          {dish.description && (
                            <Text style={{ fontSize: 12, color: '#6b7280' }} numberOfLines={1}>
                              {dish.description}
                            </Text>
                          )}
                          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            {dish.spiciness && dish.spiciness !== 'none' && (
                              <Text style={{ fontSize: 11, color: '#ef4444' }}>
                                🌶️ {getSpicinessLabel(dish.spiciness)}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: '#f97316' }}>
                            ¥{dish.price}
                          </Text>
                          
                          {/* 数量控制区域 */}
                          {quantity > 0 ? (
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View
                                hoverClass="opacity-70"
                                onClick={(e) => handleRemoveFromCart(dish, e)}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  backgroundColor: '#fff7ed',
                                  borderWidth: 1,
                                  borderColor: '#f97316',
                                  borderStyle: 'solid',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Text style={{ color: '#f97316', fontSize: 16, fontWeight: '600' }}>-</Text>
                              </View>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', width: 24, textAlign: 'center' }}>
                                {quantity}
                              </Text>
                              <View
                                hoverClass="opacity-70"
                                onClick={(e) => handleAddToCart(dish, e)}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  backgroundColor: '#f97316',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>+</Text>
                              </View>
                            </View>
                          ) : (
                            <View
                              hoverClass="opacity-80"
                              onClick={(e) => handleAddToCart(dish, e)}
                              style={{
                                backgroundColor: '#f97316',
                                borderRadius: 6,
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 6,
                                paddingBottom: 6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>点单</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* 底部购物车栏 */}
      {getTotalCartCount() > 0 && (
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
            padding: 10,
            paddingLeft: 16,
            paddingRight: 16,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
            boxSizing: 'border-box'
          }}
        >
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              onClick={() => Taro.switchTab({ url: '/pages/cart/index' })}
            >
              <Text style={{ fontSize: 20 }}>🛒</Text>
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{getTotalCartCount()}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f97316', marginLeft: 12 }}>
              ¥{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </Text>
          </View>
          <View
            hoverClass="opacity-80"
            onClick={() => Taro.switchTab({ url: '/pages/cart/index' })}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 20,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 10,
              paddingBottom: 10
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>去结算</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default MenuPage
