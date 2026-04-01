# 远程点餐小程序设计指南

## 品牌定位

- **应用定位**：餐厅远程点餐与留言系统，支持精细化分类和社区互动
- **设计风格**：简洁、清晰、易操作，符合餐饮行业特点
- **目标用户**：餐厅顾客，需要快速浏览菜品、下单、留言和预约

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
- **辣度**：`text-red-500` - 辣味标识

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

## 导航结构

### 页面配置

使用 TabBar 导航，包含以下页面：

1. **菜单页**（`pages/menu/index`）
   - 左侧分类栏（菜系、烹饪方式）
   - 顶部新品轮播
   - 右侧菜品列表

2. **购物车页**（`pages/cart/index`）
   - 购物车列表
   - 数量修改
   - 结算功能

3. **我想吃页**（`pages/wishlist/index`）
   - 添加想吃的菜品
   - 投票功能
   - 排行榜

4. **预约页**（`pages/reservation/index`）
   - 预约时间选择
   - 联系方式
   - 预约记录

5. **留言页**（`pages/messages/index`）
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
      pagePath: 'pages/cart/index',
      text: '购物车',
      iconPath: './assets/tabbar/shopping-cart.png',
      selectedIconPath: './assets/tabbar/shopping-cart-active.png',
    },
    {
      pagePath: 'pages/wishlist/index',
      text: '我想吃',
      iconPath: './assets/tabbar/heart.png',
      selectedIconPath: './assets/tabbar/heart-active.png',
    },
    {
      pagePath: 'pages/reservation/index',
      text: '预约',
      iconPath: './assets/tabbar/calendar.png',
      selectedIconPath: './assets/tabbar/calendar-active.png',
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

## 菜品分类系统

### 菜系分类
- 川菜：麻辣鲜香
- 粤菜：清淡鲜美
- 鲁菜：醇厚香浓
- 苏菜：清淡甜美
- 浙菜：鲜嫩脆爽
- 闽菜：清鲜醇和
- 湘菜：香辣浓郁
- 徽菜：鲜香酥嫩
- 家常菜：简单美味

### 烹饪方式分类
- 炖：文火慢炖
- 烧：红烧焖烧
- 煮：清煮白灼
- 蒸：清蒸粉蒸
- 炒：爆炒快炒
- 炸：油炸煎炸
- 烤：烘烤烧烤
- 凉拌：清爽开胃

## 菜品详情规范

### 基本信息
- **菜品图片**：多张图片支持，第一张为主图
- **价格**：显示基础价格，规格影响最终价格
- **库存**：显示剩余库存，不足时提示
- **描述**：菜品特色、食材、口味介绍

### 规格属性
- **辣度**：不辣、微辣、中辣、特辣
- **温度**：热、常温、冰
- **规格**：
  - 尺寸：小份、中份、大份
  - 口味：原味、香辣、麻辣、酸甜等
  - 配料：加蛋、加肉、加菜等

### 价格计算
- 基础价格 + 规格差价 = 最终价格

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
