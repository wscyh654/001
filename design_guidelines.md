# 远程点餐小程序设计指南

## 品牌定位

- **应用定位**：餐厅远程点餐与留言系统
- **设计风格**：简洁、清晰、易操作，符合餐饮行业特点
- **目标用户**：餐厅顾客，需要快速浏览菜品、下单和留言

## 配色方案

### 主色调（餐饮暖色调）
- **主色**：`bg-orange-500` / `text-orange-500` - 橙色，符合餐饮行业，温暖有食欲
- **主色深色**：`bg-orange-600` / `text-orange-600` - 按钮悬停/选中态
- **主色浅色**：`bg-orange-50` / `text-orange-50` - 背景色

### 中性色
- **文字主色**：`text-gray-900` - 主要文字
- **文字辅色**：`text-gray-600` - 次要文字
- **文字弱色**：`text-gray-400` - 提示文字
- **分割线**：`border-gray-200` / `bg-gray-100`
- **背景色**：`bg-gray-50`

### 语义色
- **成功**：`bg-green-500` / `text-green-500` - 订单完成
- **警告**：`bg-yellow-500` / `text-yellow-500` - 订单待确认
- **错误**：`bg-red-500` / `text-red-500` - 订单取消

## 字体规范

- **标题**：`text-xl font-bold text-gray-900`
- **副标题**：`text-lg font-semibold text-gray-800`
- **正文**：`text-base text-gray-700`
- **辅助文字**：`text-sm text-gray-500`
- **价格**：`text-lg font-bold text-orange-500`

## 间距系统

- **页面边距**：`p-4`
- **卡片内边距**：`p-4`
- **组件间距**：`gap-3`
- **垂直间距**：`space-y-3`
- **水平间距**：`space-x-3`

## 组件规范

### 按钮样式

```tsx
// 主按钮
<View className="bg-orange-500 text-white rounded-lg py-3 px-6">
  <Text className="block text-center font-semibold text-base">提交订单</Text>
</View>

// 次按钮
<View className="bg-gray-100 text-gray-700 rounded-lg py-3 px-6">
  <Text className="block text-center font-semibold text-base">取消</Text>
</View>

// 小按钮
<View className="bg-orange-500 text-white rounded-lg py-2 px-4">
  <Text className="block text-center font-semibold text-sm">加入购物车</Text>
</View>
```

### 卡片/容器样式

```tsx
// 菜品卡片
<View className="bg-white rounded-xl shadow-sm p-4 mb-3">
  <View className="w-full h-32 bg-gray-100 rounded-lg mb-3">
    <Image src={dish.image} className="w-full h-full rounded-lg" mode="aspectFill" />
  </View>
  <Text className="block text-base font-semibold text-gray-900 mb-1">{dish.name}</Text>
  <Text className="block text-sm text-gray-500 mb-2">{dish.description}</Text>
  <View className="flex justify-between items-center">
    <Text className="text-lg font-bold text-orange-500">¥{dish.price}</Text>
    <View className="bg-orange-500 text-white rounded-lg py-2 px-4">
      <Text className="block text-center font-semibold text-sm">加入购物车</Text>
    </View>
  </View>
</View>

// 留言卡片
<View className="bg-white rounded-xl shadow-sm p-4 mb-3">
  <Text className="block text-base text-gray-900 mb-2">{message.content}</Text>
  <Text className="block text-sm text-gray-400">{message.createdAt}</Text>
</View>
```

### 输入框样式

```tsx
// 文本输入框
<View className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
  <Input
    className="w-full bg-transparent text-base"
    placeholder="请输入内容"
    placeholderClass="text-gray-400"
  />
</View>

// 多行文本输入
<View className="bg-gray-50 rounded-xl p-4 mb-4">
  <Textarea
    style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent' }}
    placeholder="请输入留言内容..."
    maxlength={500}
  />
</View>
```

### 空状态

```tsx
<View className="flex flex-col items-center justify-center py-12">
  <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
    <Text className="text-3xl">📋</Text>
  </View>
  <Text className="block text-base text-gray-500">暂无留言</Text>
</View>
```

### 加载状态

```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-base text-gray-500">加载中...</Text>
</View>
```

## 导航结构

### 页面配置

使用 TabBar 导航，包含以下页面：

1. **菜单页**（`pages/menu/index`）
   - 展示菜品分类（热菜、凉菜、饮品、主食）
   - 展示菜品列表
   - 支持筛选和搜索

2. **订单页**（`pages/orders/index`）
   - 展示购物车
   - 确认订单信息
   - 提交订单

3. **留言页**（`pages/messages/index`）
   - 展示留言列表
   - 发表新留言

### TabBar 配置

```typescript
tabBar: {
  color: '#999999',
  selectedColor: '#f97316',  // orange-500
  backgroundColor: '#ffffff',
  borderStyle: 'black',
  list: [
    {
      pagePath: 'pages/menu/index',
      text: '菜单',
      iconPath: './assets/tabbar/menu.png',
      selectedIconPath: './assets/tabbar/menu-active.png',
    },
    {
      pagePath: 'pages/orders/index',
      text: '订单',
      iconPath: './assets/tabbar/shopping-cart.png',
      selectedIconPath: './assets/tabbar/shopping-cart-active.png',
    },
    {
      pagePath: 'pages/messages/index',
      text: '留言',
      iconPath: './assets/tabbar/message-square.png',
      selectedIconPath: './assets/tabbar/message-square-active.png',
    }
  ]
}
```

## 小程序约束

### 包体积限制
- 主包大小：≤ 2MB
- 分包大小：≤ 2MB
- 总包大小：≤ 20MB

### 图片策略
- 使用 CDN 存储菜品图片
- 控制图片大小，优化加载速度
- 使用 lazy loading 优化体验

### 性能优化
- 菜品列表使用虚拟滚动（长列表时）
- 图片懒加载
- 合理使用缓存

## 跨端兼容性

- 使用 Tailwind CSS 样式
- 所有 Text 组件需要垂直排列时添加 `block` 类
- Input 组件使用 View 包裹，样式放在 View 上
- Fixed + Flex 布局使用 inline style
- 使用 Taro.getEnv() 检测平台
