export default defineAppConfig({
  pages: [
    'pages/menu/index',
    'pages/cart/index',
    'pages/orders/index',
    'pages/messages/index',
    'pages/dish-manage/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '点餐小程序',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#f97316',
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
        pagePath: 'pages/orders/index',
        text: '订单',
        iconPath: './assets/tabbar/list.png',
        selectedIconPath: './assets/tabbar/list-active.png',
      },
      {
        pagePath: 'pages/messages/index',
        text: '留言',
        iconPath: './assets/tabbar/message-square.png',
        selectedIconPath: './assets/tabbar/message-square-active.png',
      }
    ]
  }
})
