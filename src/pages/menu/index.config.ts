export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '菜单' })
  : { navigationBarTitleText: '菜单' }
