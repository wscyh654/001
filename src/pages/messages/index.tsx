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
    <View style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      <ScrollView scrollY style={{ flex: 1, padding: 12 }}>
        {loading ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>加载中...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#f3f4f6', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>💬</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>暂无留言</Text>
          </View>
        ) : (
          <View>
            {messages.map((message) => (
              <View 
                key={message.id} 
                style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: 12, 
                  padding: 12, 
                  marginBottom: 12,
                  boxSizing: 'border-box'
                }}
              >
                <Text style={{ fontSize: 15, color: '#111827', marginBottom: 8, lineHeight: 22 }}>
                  {message.content}
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  {formatTime(message.created_at)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部输入框 */}
      <View 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          borderTopStyle: 'solid',
          padding: 12,
          paddingLeft: 16,
          paddingRight: 16,
          zIndex: 50,
          boxSizing: 'border-box'
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, boxSizing: 'border-box' }}>
            <Textarea
              style={{ width: '100%', minHeight: 40, maxHeight: 100, backgroundColor: 'transparent', fontSize: 14 }}
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
            style={{
              backgroundColor: submitting ? '#d1d5db' : '#f97316',
              borderRadius: 8,
              width: 70,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
              {submitting ? '发送中' : '发送'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default MessagesPage
