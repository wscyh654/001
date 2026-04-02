import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import { isAdmin, getUserId } from '@/utils/user'
import './index.css'

interface Message {
  id: string
  content: string
  user_id: string | null
  created_at: string
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputContent, setInputContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editContent, setEditContent] = useState('')

  useLoad(() => {
    fetchMessages()
  })

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/messages',
        method: 'GET'
      })
      console.log('Messages response:', res.data)
      if (res.data && res.data.data) {
        setMessages(res.data.data)
      }
    } catch (error) {
      console.error('获取留言失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMessage = async () => {
    if (!inputContent.trim()) {
      console.log('请输入留言内容')
      return
    }

    try {
      setSubmitting(true)
      const userId = getUserId()
      const res = await Network.request({
        url: '/api/messages',
        method: 'POST',
        data: {
          content: inputContent.trim(),
          user_id: userId
        }
      })
      console.log('Message response:', res.data)

      if (res.data && res.data.data) {
        setInputContent('')
        fetchMessages()
      }
    } catch (error) {
      console.error('提交留言失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message)
    setEditContent(message.content)
  }

  const handleUpdateMessage = async () => {
    if (!editingMessage) return
    if (!editContent.trim()) {
      Taro.showToast({ title: '请输入留言内容', icon: 'none' })
      return
    }

    try {
      const userId = getUserId()
      const res = await Network.request({
        url: `/api/messages/${editingMessage.id}`,
        method: 'PUT',
        data: {
          content: editContent.trim(),
          user_id: userId
        }
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已更新', icon: 'success' })
        setEditingMessage(null)
        setEditContent('')
        fetchMessages()
      }
    } catch (error) {
      console.error('更新留言失败:', error)
      Taro.showToast({ title: '更新失败', icon: 'none' })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    const result = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条留言吗？'
    })
    if (!result.confirm) return

    try {
      const userId = getUserId()
      const adminStatus = isAdmin()
      const res = await Network.request({
        url: `/api/messages/${messageId}`,
        method: 'DELETE',
        data: { user_id: userId, is_admin: adminStatus }
      })
      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        fetchMessages()
      }
    } catch (error) {
      console.error('删除留言失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes > 0 ? `${minutes}分钟前` : '刚刚'
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      <ScrollView scrollY className="flex-1 p-3">
        {loading ? (
          <View className="flex flex-col items-center justify-center pt-12">
            <Text className="text-sm text-gray-500">加载中...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex flex-col items-center justify-center pt-12">
            <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Text className="text-2xl">💬</Text>
            </View>
            <Text className="text-sm text-gray-500">暂无留言</Text>
          </View>
        ) : (
          <View>
            {messages.map((message) => {
              const currentUserId = getUserId()
              const isOwner = message.user_id === currentUserId
              const adminStatus = isAdmin()
              const canManage = isOwner || adminStatus

              return (
                <View
                  key={message.id}
                  className="bg-white rounded-xl p-3 mb-3"
                >
                  <Text className="text-[15px] text-gray-900 mb-2 leading-[22px]">
                    {message.content}
                  </Text>
                  <View className="flex flex-row justify-between items-center">
                    <Text className="text-xs text-gray-400">
                      {formatTime(message.created_at)}
                    </Text>
                    {canManage && (
                      <View className="flex flex-row gap-2">
                        <View
                          className="px-3 py-1 rounded-full bg-blue-50"
                          onClick={() => handleEditMessage(message)}
                        >
                          <Text className="text-xs text-blue-500">编辑</Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full bg-red-50"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Text className="text-xs text-red-500">删除</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* 编辑留言弹窗 */}
        {editingMessage && (
          <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <View className="bg-white rounded-2xl p-4 mx-4 w-full max-w-sm">
              <Text className="text-base font-semibold text-gray-900 mb-3">编辑留言</Text>
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <Textarea
                  className="w-full bg-transparent text-sm"
                  style={{ minHeight: '80px' }}
                  placeholder="请输入留言内容..."
                  value={editContent}
                  onInput={(e) => setEditContent(e.detail.value)}
                  maxlength={200}
                />
              </View>
              <View className="flex flex-row gap-2">
                <View
                  className="flex-1 bg-gray-200 rounded-full py-2 flex items-center justify-center"
                  onClick={() => { setEditingMessage(null); setEditContent('') }}
                >
                  <Text className="text-sm text-gray-600">取消</Text>
                </View>
                <View
                  className="flex-1 bg-blue-500 rounded-full py-2 flex items-center justify-center"
                  onClick={handleUpdateMessage}
                >
                  <Text className="text-sm text-white font-semibold">保存</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部输入框 */}
      <View className="bg-white border-t border-gray-200 p-3 px-4">
        <View className="flex flex-row items-center gap-3">
          <View className="flex-1 bg-gray-50 rounded-xl p-3">
            <Textarea
              className="w-full bg-transparent text-sm"
              style={{ minHeight: '40px', maxHeight: '100px' }}
              placeholder="说点什么..."
              value={inputContent}
              onInput={(e) => setInputContent(e.detail.value)}
              maxlength={200}
              autoHeight
            />
          </View>
          <View
            hoverClass="opacity-80"
            onClick={submitting ? undefined : handleSubmitMessage}
            className={`rounded-full flex items-center justify-center flex-shrink-0 ${
              submitting ? 'bg-gray-300' : 'bg-orange-500'
            }`}
            style={{ width: '70px', height: '44px' }}
          >
            <Text className="text-white font-semibold text-sm">
              {submitting ? '发送中' : '发送'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default MessagesPage
