export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '留言' })
  : { navigationBarTitleText: '留言' }
