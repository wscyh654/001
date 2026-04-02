import { View, Text, Image, ScrollView, Input, Textarea, Button, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Spec {
  name: string
  isRequired: boolean
  options: Array<{ name: string; price: number }>
}

interface Dish {
  id: string
  name: string
  category: string
  cuisine_type?: string
  cooking_method?: string
  price: number
  image?: string
  description?: string
  stock: number
  spiciness?: string
  temperature?: string
  is_new?: boolean
}

export default function DishManagePage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '热菜',
    cuisineType: '',
    cookingMethod: '',
    price: '',
    image: '',
    description: '',
    spiciness: 'none',
    temperature: 'hot',
    isNew: false
  })
  const [specs, setSpecs] = useState<Spec[]>([])
  const [newSpecName, setNewSpecName] = useState('')
  const [newSpecRequired, setNewSpecRequired] = useState(true)
  const [optionInputs, setOptionInputs] = useState<Record<number, { name: string; price: string }>>({})

  const categories = ['热菜', '凉菜', '主食', '汤品', '饮品', '甜点']
  const cuisines = ['', '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '家常菜']
  const cookingMethods = ['', '炒', '煮', '蒸', '炖', '炸', '烤', '凉拌', '红烧', '清蒸']
  const spicinessOptions = [
    { value: 'none', label: '不辣' },
    { value: 'mild', label: '微辣' },
    { value: 'medium', label: '中辣' },
    { value: 'hot', label: '特辣' }
  ]
  const temperatureOptions = [
    { value: 'hot', label: '热' },
    { value: 'warm', label: '温' },
    { value: 'cold', label: '凉' }
  ]

  useLoad(() => {
    loadDishes()
  })

  const loadDishes = async () => {
    try {
      const res = await Network.request({ url: '/api/dishes' })
      console.log('加载菜品列表:', res.data)
      if (res.data.code === 200) {
        setDishes(res.data.data || [])
      }
    } catch (error) {
      console.error('加载菜品失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      const tempFilePath = res.tempFilePaths[0]
      setUploading(true)
      Taro.showLoading({ title: '上传中...' })

      const fileManager = Taro.getFileSystemManager()
      const fileInfo = fileManager.readFileSync(tempFilePath)
      const base64 = Taro.arrayBufferToBase64(fileInfo as ArrayBuffer)
      const fileName = tempFilePath.split('/').pop() || 'image.jpg'

      const uploadRes = await Network.request({
        url: '/api/upload/image',
        method: 'POST',
        data: {
          fileData: `data:image/jpeg;base64,${base64}`,
          fileName
        }
      })

      console.log('上传结果:', uploadRes.data)

      if (uploadRes.data.code === 200) {
        setFormData({ ...formData, image: uploadRes.data.data.url })
        Taro.showToast({ title: '上传成功', icon: 'success' })
      } else {
        throw new Error(uploadRes.data.msg)
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      setUploading(false)
      Taro.hideLoading()
    }
  }

  // 添加规格项
  const addSpec = () => {
    if (!newSpecName.trim()) {
      Taro.showToast({ title: '请输入规格名称', icon: 'none' })
      return
    }
    setSpecs([...specs, {
      name: newSpecName.trim(),
      isRequired: newSpecRequired,
      options: []
    }])
    setNewSpecName('')
    setNewSpecRequired(true)
  }

  // 删除规格项
  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  // 添加规格选项
  const addSpecOption = (specIndex: number) => {
    const input = optionInputs[specIndex]
    if (!input || !input.name.trim()) {
      Taro.showToast({ title: '请输入选项名称', icon: 'none' })
      return
    }
    const newSpecs = [...specs]
    newSpecs[specIndex].options.push({
      name: input.name.trim(),
      price: parseFloat(input.price) || 0
    })
    setSpecs(newSpecs)
    setOptionInputs({ ...optionInputs, [specIndex]: { name: '', price: '' } })
  }

  // 删除规格选项
  const removeSpecOption = (specIndex: number, optionIndex: number) => {
    const newSpecs = [...specs]
    newSpecs[specIndex].options = newSpecs[specIndex].options.filter((_, i) => i !== optionIndex)
    setSpecs(newSpecs)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入菜品名称', icon: 'none' })
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Taro.showToast({ title: '请输入有效价格', icon: 'none' })
      return
    }

    try {
      Taro.showLoading({ title: '保存中...' })

      const dishData = {
        name: formData.name.trim(),
        category: formData.category,
        cuisineType: formData.cuisineType || undefined,
        cookingMethod: formData.cookingMethod || undefined,
        price: parseFloat(formData.price),
        image: formData.image || undefined,
        description: formData.description.trim() || undefined,
        stock: 999,
        spiciness: formData.spiciness,
        temperature: formData.temperature,
        isNew: formData.isNew,
        specifications: specs.length > 0 ? specs : undefined
      }

      console.log('提交菜品数据:', dishData)

      const res = await Network.request({
        url: '/api/dishes',
        method: 'POST',
        data: dishData
      })

      console.log('创建结果:', res.data)

      if (res.data.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' })
        resetForm()
        loadDishes()
      } else {
        throw new Error(res.data.msg)
      }
    } catch (error) {
      console.error('添加菜品失败:', error)
      Taro.showToast({ title: '添加失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const { confirm } = await Taro.showModal({
        title: '确认删除',
        content: `确定要删除"${name}"吗？`
      })

      if (!confirm) return

      Taro.showLoading({ title: '删除中...' })

      const res = await Network.request({
        url: `/api/dishes/${id}`,
        method: 'DELETE'
      })

      if (res.data.code === 200) {
        Taro.showToast({ title: '删除成功', icon: 'success' })
        loadDishes()
      } else {
        throw new Error(res.data.msg)
      }
    } catch (error) {
      console.error('删除菜品失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '热菜',
      cuisineType: '',
      cookingMethod: '',
      price: '',
      image: '',
      description: '',
      spiciness: 'none',
      temperature: 'hot',
      isNew: false
    })
    setSpecs([])
    setShowForm(false)
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <View className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">菜品管理</Text>
        <Button
          size="mini"
          type="primary"
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 border-orange-500"
        >
          {showForm ? '取消' : '添加菜品'}
        </Button>
      </View>

      <ScrollView scrollY className="h-screen pb-20">
        {/* 添加菜品表单 */}
        {showForm && (
          <View className="bg-white mx-3 mt-3 rounded-xl p-4 shadow-sm">
            <Text className="block text-lg font-bold text-gray-900 mb-4">添加新菜品</Text>

            {/* 菜品图片 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">菜品图片</Text>
              {formData.image ? (
                <View className="relative">
                  <Image
                    src={formData.image}
                    className="w-24 h-24 rounded-lg"
                    mode="aspectFill"
                  />
                  <View
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    onClick={() => setFormData({ ...formData, image: '' })}
                  >
                    <Text className="text-white text-xs">×</Text>
                  </View>
                </View>
              ) : (
                <View
                  className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                  onClick={handleChooseImage}
                >
                  {uploading ? (
                    <Text className="text-gray-400 text-xs">上传中...</Text>
                  ) : (
                    <Text className="text-gray-400 text-xs">点击上传</Text>
                  )}
                </View>
              )}
            </View>

            {/* 菜品名称 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">菜品名称 *</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Input
                  className="w-full"
                  placeholder="请输入菜品名称"
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                />
              </View>
            </View>

            {/* 分类和菜系 */}
            <View className="flex gap-3 mb-4">
              <View className="flex-1">
                <Text className="block text-sm font-medium text-gray-700 mb-2">分类 *</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <Picker
                    mode="selector"
                    range={categories}
                    value={categories.indexOf(formData.category)}
                    onChange={(e) => setFormData({ ...formData, category: categories[e.detail.value] })}
                  >
                    <Text className="text-gray-900">{formData.category}</Text>
                  </Picker>
                </View>
              </View>
              <View className="flex-1">
                <Text className="block text-sm font-medium text-gray-700 mb-2">菜系</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <Picker
                    mode="selector"
                    range={cuisines}
                    value={cuisines.indexOf(formData.cuisineType)}
                    onChange={(e) => setFormData({ ...formData, cuisineType: cuisines[e.detail.value] })}
                  >
                    <Text className={formData.cuisineType ? 'text-gray-900' : 'text-gray-400'}>
                      {formData.cuisineType || '选择菜系'}
                    </Text>
                  </Picker>
                </View>
              </View>
            </View>

            {/* 价格 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">价格（元）*</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Input
                  className="w-full"
                  type="digit"
                  placeholder="0.00"
                  value={formData.price}
                  onInput={(e) => setFormData({ ...formData, price: e.detail.value })}
                />
              </View>
            </View>

            {/* 烹饪方式 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">烹饪方式</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Picker
                  mode="selector"
                  range={cookingMethods}
                  value={cookingMethods.indexOf(formData.cookingMethod)}
                  onChange={(e) => setFormData({ ...formData, cookingMethod: cookingMethods[e.detail.value] })}
                >
                  <Text className={formData.cookingMethod ? 'text-gray-900' : 'text-gray-400'}>
                    {formData.cookingMethod || '选择烹饪方式'}
                  </Text>
                </Picker>
              </View>
            </View>

            {/* 辣度和温度 */}
            <View className="flex gap-3 mb-4">
              <View className="flex-1">
                <Text className="block text-sm font-medium text-gray-700 mb-2">辣度</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <Picker
                    mode="selector"
                    range={spicinessOptions.map(s => s.label)}
                    value={spicinessOptions.findIndex(s => s.value === formData.spiciness)}
                    onChange={(e) => setFormData({ ...formData, spiciness: spicinessOptions[e.detail.value].value })}
                  >
                    <Text className="text-gray-900">{spicinessOptions.find(s => s.value === formData.spiciness)?.label}</Text>
                  </Picker>
                </View>
              </View>
              <View className="flex-1">
                <Text className="block text-sm font-medium text-gray-700 mb-2">温度</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <Picker
                    mode="selector"
                    range={temperatureOptions.map(t => t.label)}
                    value={temperatureOptions.findIndex(t => t.value === formData.temperature)}
                    onChange={(e) => setFormData({ ...formData, temperature: temperatureOptions[e.detail.value].value })}
                  >
                    <Text className="text-gray-900">{temperatureOptions.find(t => t.value === formData.temperature)?.label}</Text>
                  </Picker>
                </View>
              </View>
            </View>

            {/* 描述 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">菜品描述</Text>
              <View className="bg-gray-50 rounded-lg p-3">
                <Textarea
                  style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent' }}
                  placeholder="请输入菜品描述..."
                  value={formData.description}
                  onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                  maxlength={200}
                />
              </View>
            </View>

            {/* 规格设置 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">规格设置</Text>
              <View className="bg-gray-50 rounded-lg p-3">
                {/* 已添加的规格列表 */}
                {specs.map((spec, specIndex) => (
                  <View key={specIndex} className="bg-white rounded-lg p-3 mb-2">
                    <View className="flex items-center justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <Text className="font-medium text-gray-900">{spec.name}</Text>
                        {spec.isRequired && (
                          <View className="bg-red-100 px-1 py-0.5 rounded">
                            <Text className="text-xs text-red-600">必选</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-red-500 text-sm" onClick={() => removeSpec(specIndex)}>删除</Text>
                    </View>
                    {/* 规格选项 */}
                    <View className="flex flex-wrap gap-2">
                      {spec.options.map((opt, optIndex) => (
                        <View key={optIndex} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                          <Text className="text-sm text-gray-700">{opt.name}</Text>
                          {opt.price > 0 && <Text className="text-xs text-orange-500">+¥{opt.price}</Text>}
                          <Text className="text-gray-400 text-xs ml-1" onClick={() => removeSpecOption(specIndex, optIndex)}>×</Text>
                        </View>
                      ))}
                    </View>
                    {/* 添加选项 */}
                    <View className="flex gap-2 mt-2">
                      <View className="flex-1 bg-gray-50 rounded px-2 py-1">
                        <Input
                          className="w-full text-sm"
                          placeholder="选项名"
                          value={optionInputs[specIndex]?.name || ''}
                          onInput={(e) => setOptionInputs({
                            ...optionInputs,
                            [specIndex]: { ...(optionInputs[specIndex] || { name: '', price: '' }), name: e.detail.value }
                          })}
                        />
                      </View>
                      <View className="w-16 bg-gray-50 rounded px-2 py-1">
                        <Input
                          className="w-full text-sm"
                          type="digit"
                          placeholder="加价"
                          value={optionInputs[specIndex]?.price || ''}
                          onInput={(e) => setOptionInputs({
                            ...optionInputs,
                            [specIndex]: { ...(optionInputs[specIndex] || { name: '', price: '' }), price: e.detail.value }
                          })}
                        />
                      </View>
                      <View
                        className="bg-orange-500 px-2 py-1 rounded"
                        onClick={() => addSpecOption(specIndex)}
                      >
                        <Text className="text-white text-sm">添加</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {/* 添加新规格 */}
                <View className="flex gap-2 items-center">
                  <View className="flex-1 bg-white rounded px-3 py-2">
                    <Input
                      className="w-full text-sm"
                      placeholder="规格名称（如：份量、口味）"
                      value={newSpecName}
                      onInput={(e) => setNewSpecName(e.detail.value)}
                    />
                  </View>
                  <View className="flex items-center gap-1" onClick={() => setNewSpecRequired(!newSpecRequired)}>
                    <View className={`w-4 h-4 rounded border ${newSpecRequired ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                      {newSpecRequired && <Text className="text-white text-xs text-center">✓</Text>}
                    </View>
                    <Text className="text-xs text-gray-600">必选</Text>
                  </View>
                  <View className="bg-orange-500 px-3 py-2 rounded" onClick={addSpec}>
                    <Text className="text-white text-sm">添加规格</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 是否新品 */}
            <View className="mb-4 flex items-center">
              <View
                className={`w-12 h-6 rounded-full p-1 ${formData.isNew ? 'bg-orange-500' : 'bg-gray-300'}`}
                onClick={() => setFormData({ ...formData, isNew: !formData.isNew })}
              >
                <View className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isNew ? 'translate-x-6' : ''}`} />
              </View>
              <Text className="ml-3 text-sm text-gray-700">标记为新品</Text>
            </View>

            {/* 提交按钮 */}
            <Button
              type="primary"
              className="bg-orange-500 border-orange-500 w-full"
              onClick={handleSubmit}
              disabled={uploading}
            >
              保存菜品
            </Button>
          </View>
        )}

        {/* 菜品列表 */}
        <View className="px-3 mt-3">
          <Text className="block text-sm font-medium text-gray-500 mb-2">已有菜品 ({dishes.length})</Text>
          {dishes.length === 0 ? (
            <View className="bg-white rounded-xl p-8 flex items-center justify-center">
              <Text className="text-gray-400">暂无菜品，点击上方按钮添加</Text>
            </View>
          ) : (
            dishes.map((dish) => (
              <View key={dish.id} className="bg-white rounded-xl p-3 mb-2 flex items-center">
                {dish.image && (
                  <Image src={dish.image} className="w-16 h-16 rounded-lg mr-3" mode="aspectFill" />
                )}
                <View className="flex-1">
                  <View className="flex items-center">
                    <Text className="font-semibold text-gray-900">{dish.name}</Text>
                    {dish.is_new && (
                      <View className="ml-2 px-1 py-0.5 bg-orange-100 rounded">
                        <Text className="text-orange-600 text-xs">新品</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">
                    ¥{dish.price} · {dish.category} {dish.cuisine_type ? `· ${dish.cuisine_type}` : ''}
                  </Text>
                </View>
                <View
                  className="px-3 py-1 bg-red-50 rounded"
                  onClick={() => handleDelete(dish.id, dish.name)}
                >
                  <Text className="text-red-500 text-sm">删除</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
