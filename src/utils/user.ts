import Taro from '@tarojs/taro'

const USER_ID_KEY = 'restaurant_user_id'
const ADMIN_KEY = 'restaurant_is_admin'

// 生成 UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 获取或创建用户 ID
export const getUserId = (): string => {
  let userId = Taro.getStorageSync(USER_ID_KEY)
  if (!userId) {
    userId = generateUUID()
    Taro.setStorageSync(USER_ID_KEY, userId)
  }
  return userId
}

// 检查是否是管理员
export const isAdmin = (): boolean => {
  return Taro.getStorageSync(ADMIN_KEY) === true
}

// 设置管理员状态
export const setAdminStatus = (status: boolean): void => {
  Taro.setStorageSync(ADMIN_KEY, status)
}

// 清除管理员状态
export const clearAdminStatus = (): void => {
  Taro.removeStorageSync(ADMIN_KEY)
}
