export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '菜品管理' })
  : { navigationBarTitleText: '菜品管理' }
