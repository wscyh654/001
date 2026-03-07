import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import './index.css'

interface Message {
  id: string
  content: string
  created_at: string
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputContent, setInputContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
      const res = await Network.request({
        url: '/api/messages',
        method: 'POST',
        data: {
          content: inputContent.trim()
        }
      })
      console.log('Message response:', res.data)

      if (res.data && res.data.data) {
        setInputContent('')
        // 重新获取留言列表
        fetchMessages()
      }
    } catch (error) {
      console.error('提交留言失败:', error)
    } finally {
      setSubmitting(false)
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
      <ScrollView scrollY className="flex-1 p-4">
        {loading ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Text className="text-base text-gray-500">加载中...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Text className="text-3xl">💬</Text>
            </View>
            <Text className="block text-base text-gray-500">暂无留言</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {messages.map((message) => (
              <View key={message.id} className="bg-white rounded-xl shadow-sm p-4">
                <Text className="block text-base text-gray-900 mb-2">
                  {message.content}
                </Text>
                <Text className="block text-sm text-gray-400">
                  {formatTime(message.created_at)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部输入框 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <View className="flex gap-3">
          <View className="flex-1 bg-gray-50 rounded-xl p-4">
            <Textarea
              style={{ width: '100%', minHeight: '40px', maxHeight: '120px', backgroundColor: 'transparent' }}
              placeholder="说点什么..."
              value={inputContent}
              onInput={(e) => setInputContent(e.detail.value)}
              maxlength={200}
              autoHeight
            />
          </View>
          <View
            onClick={submitting ? undefined : handleSubmitMessage}
            className={`${
              submitting ? 'bg-gray-300' : 'bg-orange-500'
            } text-white rounded-lg py-3 px-6 flex-shrink-0`}
          >
            <Text className="block text-center font-semibold text-sm">
              {submitting ? '发送中...' : '发送'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default MessagesPage
