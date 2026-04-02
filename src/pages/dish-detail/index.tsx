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
  is_active: boolean
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
      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>加载中...</Text>
      </View>
    )
  }

  if (!dish) {
    return (
      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>菜品不存在</Text>
      </View>
    )
  }

  const spicinessOptions = getSpicinessOptions()
  const temperatureOptions = getTemperatureOptions()
  const hasSpecifications = dish.specifications && Array.isArray(dish.specifications) && dish.specifications.length > 0

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      <ScrollView scrollY style={{ flex: 1 }}>
        {/* 菜品图片 */}
        <View style={{ width: '100%', height: 256, backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
          {dish.image ? (
            <Image
              src={dish.image}
              style={{ width: '100%', height: '100%' }}
              mode="aspectFill"
            />
          ) : (
            <View style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 64 }}>🍜</Text>
            </View>
          )}
        </View>

        {/* 基本信息 */}
        <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 8, boxSizing: 'border-box' }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }} numberOfLines={1}>{dish.name}</Text>
            {dish.cuisine_type && (
              <View style={{ backgroundColor: '#fff7ed', paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 11, color: '#ea580c' }}>{dish.cuisine_type}</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#f97316' }}>¥{dish.price}</Text>
          {dish.description && (
            <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 20, marginTop: 12 }}>{dish.description}</Text>
          )}
        </View>

        {/* 规格选择 */}
        {hasSpecifications && dish.specifications!.map((spec, specIndex) => (
          <View key={`spec-${specIndex}`} style={{ backgroundColor: '#fff', padding: 16, marginBottom: 8, boxSizing: 'border-box' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 }}>{spec.name}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {spec.options.map((option, optIndex) => {
                const isSelected = selectedSpecs[spec.name] === option.name
                return (
                  <View
                    key={`opt-${optIndex}`}
                    hoverClass="bg-gray-100"
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#f97316' : '#e5e7eb',
                      backgroundColor: isSelected ? '#fff7ed' : '#fff'
                    }}
                    onClick={() => {
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
          <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 8, boxSizing: 'border-box' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 }}>辣度</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {spicinessOptions.map((option, idx) => {
                const isSelected = selectedSpiciness === option.value
                return (
                  <View
                    key={`spice-${idx}`}
                    hoverClass="bg-gray-100"
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#f97316' : '#e5e7eb',
                      backgroundColor: isSelected ? '#fff7ed' : '#fff'
                    }}
                    onClick={() => setSelectedSpiciness(option.value)}
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
          <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 8, boxSizing: 'border-box' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 }}>温度</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {temperatureOptions.map((option, idx) => {
                const isSelected = selectedTemperature === option.value
                return (
                  <View
                    key={`temp-${idx}`}
                    hoverClass="bg-gray-100"
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#f97316' : '#e5e7eb',
                      backgroundColor: isSelected ? '#fff7ed' : '#fff'
                    }}
                    onClick={() => setSelectedTemperature(option.value)}
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
        <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 8, boxSizing: 'border-box' }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>数量</Text>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View
                hoverClass="opacity-70"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: quantity > 1 ? '#fff7ed' : '#f3f4f6',
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{quantity}</Text>
              <View
                hoverClass="opacity-70"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#fff7ed',
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
          borderTopColor: '#e5e7eb',
          borderTopStyle: 'solid',
          padding: 12,
          paddingLeft: 16,
          paddingRight: 16,
          zIndex: 100,
          boxSizing: 'border-box'
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>合计</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#f97316' }}>¥{calculateTotalPrice()}</Text>
          </View>
          <View
            hoverClass="opacity-80"
            style={{ backgroundColor: '#f97316', borderRadius: 20, paddingTop: 12, paddingBottom: 12, paddingLeft: 32, paddingRight: 32 }}
            onClick={handleAddToCart}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>加入购物车</Text>
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
              width: '85%',
              maxWidth: 320,
              boxSizing: 'border-box'
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#111827' }}>添加留言</Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>有什么特殊要求可以告诉我们（选填）</Text>
            <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Input
                style={{ width: '100%', minHeight: 60, fontSize: 14 }}
                placeholder="例如：少放辣椒、多加葱..."
                value={note}
                onInput={(e) => setNote(e.detail.value)}
                maxlength={100}
              />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
              <View 
                hoverClass="opacity-70"
                style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingTop: 12, paddingBottom: 12 }}
                onClick={handleSkipNote}
              >
                <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>跳过</Text>
              </View>
              <View 
                hoverClass="opacity-80"
                style={{ flex: 1, backgroundColor: '#f97316', borderRadius: 20, paddingTop: 12, paddingBottom: 12 }}
                onClick={handleConfirmNote}
              >
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: 14 }}>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default DishDetailPage
