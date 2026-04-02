export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '主页图片管理' })
  : { navigationBarTitleText: '主页图片管理' }
