import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface SpecOption {
  name: string
  price: number
}

interface Spec {
  name: string
  options: SpecOption[]
  isRequired: boolean
}

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
  specifications: Spec[] | null
  is_available: boolean
}

const DishDetailPage = () => {
  const router = useRouter()
  const [dish, setDish] = useState<DishDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({})
  const [selectedSpiciness, setSelectedSpiciness] = useState<string>('')
  const [selectedTemperature, setSelectedTemperature] = useState<string>('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [note, setNote] = useState('')

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
        setDish(res.data.data)
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
    
    if (dish.specifications && Array.isArray(dish.specifications)) {
      dish.specifications.forEach((spec) => {
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

  const handleAddToCart = () => {
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
    
    setShowNoteModal(true)
  }

  const handleSkipNote = () => {
    setShowNoteModal(false)
    submitToCart('')
  }

  const handleConfirmNote = () => {
    setShowNoteModal(false)
    submitToCart(note.trim())
  }

  const submitToCart = async (noteText: string) => {
    if (!dish) return

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
          },
          note: noteText || undefined
        }
      })
      
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已加入购物车', icon: 'success' })
        setNote('')
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

  const spicinessOptions = getSpicinessOptions()
  const temperatureOptions = getTemperatureOptions()
  const hasSpecifications = dish.specifications && Array.isArray(dish.specifications) && dish.specifications.length > 0

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

        {/* 基本信息 */}
        <View className="bg-white p-4 mb-2">
          <View className="flex items-center gap-2 mb-2">
            <Text className="text-xl font-bold text-gray-900">{dish.name}</Text>
            {dish.cuisine_type && (
              <View className="bg-orange-100 px-2 py-0.5 rounded">
                <Text className="text-xs text-orange-600">{dish.cuisine_type}</Text>
              </View>
            )}
          </View>
          <Text className="text-2xl font-bold text-orange-500">¥{dish.price}</Text>
          {dish.description && (
            <Text className="text-sm text-gray-600 leading-relaxed mt-3">{dish.description}</Text>
          )}
        </View>

        {/* 规格选择 - 使用更简单直接的方式 */}
        {hasSpecifications && dish.specifications!.map((spec, specIndex) => (
          <View key={`spec-${specIndex}`} className="bg-white p-4 mb-2">
            <Text className="text-base font-semibold text-gray-900 mb-3">{spec.name}</Text>
            <View className="flex flex-wrap gap-3">
              {spec.options.map((option, optIndex) => {
                const isSelected = selectedSpecs[spec.name] === option.name
                return (
                  <View
                    key={`opt-${optIndex}`}
                    hoverClass="bg-gray-100"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#f97316' : '#e5e7eb',
                      backgroundColor: isSelected ? '#fff7ed' : '#fff'
                    }}
                    onClick={() => {
                      console.log('点击规格:', spec.name, option.name)
                      setSelectedSpecs({
                        ...selectedSpecs,
                        [spec.name]: option.name
                      })
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: isSelected ? '#ea580c' : '#374151',
                      fontWeight: isSelected ? '600' : '400'
                    }}
                    >
                      {option.name}{option.price > 0 ? ` +¥${option.price}` : ''}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        ))}

        {/* 辣度选择 */}
        {dish.spiciness && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-base font-semibold text-gray-900 mb-3">辣度</Text>
            <View className="flex flex-wrap gap-3">
              {spicinessOptions.map((option, idx) => {
                const isSelected = selectedSpiciness === option.value
                return (
                  <View
                    key={`spice-${idx}`}
                    hoverClass="bg-gray-100"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#f97316' : '#e5e7eb',
                      backgroundColor: isSelected ? '#fff7ed' : '#fff'
                    }}
                    onClick={() => {
                      console.log('点击辣度:', option.value)
                      setSelectedSpiciness(option.value)
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: isSelected ? '#ea580c' : '#374151',
                      fontWeight: isSelected ? '600' : '400'
                    }}
                    >
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
            <Text className="text-base font-semibold text-gray-900 mb-3">温度</Text>
            <View className="flex flex-wrap gap-3">
              {temperatureOptions.map((option, idx) => {
                const isSelected = selectedTemperature === option.value
                return (
                  <View
                    key={`temp-${idx}`}
                    hoverClass="bg-gray-100"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#f97316' : '#e5e7eb',
                      backgroundColor: isSelected ? '#fff7ed' : '#fff'
                    }}
                    onClick={() => {
                      console.log('点击温度:', option.value)
                      setSelectedTemperature(option.value)
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: isSelected ? '#ea580c' : '#374151',
                      fontWeight: isSelected ? '600' : '400'
                    }}
                    >
                      {option.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 数量选择 */}
        <View className="bg-white p-4 mb-2">
          <View className="flex items-center justify-between">
            <Text className="text-base font-semibold text-gray-900">数量</Text>
            <View className="flex items-center gap-4">
              <View
                hoverClass="bg-gray-200"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: quantity > 1 ? '#ffedd5' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => {
                  if (quantity > 1) setQuantity(quantity - 1)
                }}
              >
                <Text style={{ color: quantity > 1 ? '#ea580c' : '#9ca3af', fontSize: 18 }}>-</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">{quantity}</Text>
              <View
                hoverClass="bg-gray-200"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#ffedd5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Text style={{ color: '#ea580c', fontSize: 18 }}>+</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          padding: 12,
          zIndex: 100
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text className="text-sm text-gray-500">合计</Text>
            <Text className="text-2xl font-bold text-orange-500">¥{calculateTotalPrice()}</Text>
          </View>
          <View
            hoverClass="opacity-80"
            style={{ backgroundColor: '#f97316', borderRadius: 8, paddingTop: 12, paddingBottom: 12, paddingLeft: 32, paddingRight: 32 }}
            onClick={handleAddToCart}
          >
            <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>加入购物车</Text>
          </View>
        </View>
      </View>

      {/* 留言弹窗 */}
      {showNoteModal && (
        <View 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
        >
          <View 
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              marginLeft: 20,
              marginRight: 20,
              width: '85%'
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>添加留言</Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>有什么特殊要求可以告诉我们（选填）</Text>
            <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Input
                style={{ width: '100%', minHeight: 60 }}
                placeholder="例如：少放辣椒、多加葱..."
                value={note}
                onInput={(e) => setNote(e.detail.value)}
                maxlength={100}
              />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
              <View 
                hoverClass="bg-gray-200"
                style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 }}
                onClick={handleSkipNote}
              >
                <Text style={{ textAlign: 'center', color: '#666' }}>跳过</Text>
              </View>
              <View 
                hoverClass="opacity-80"
                style={{ flex: 1, backgroundColor: '#f97316', borderRadius: 8, padding: 12 }}
                onClick={handleConfirmNote}
              >
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600' }}>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default DishDetailPage
