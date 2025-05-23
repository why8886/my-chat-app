
import axios from 'axios'
const API_BASE = process.env.VUE_APP_DIFY_API_URL

export default {
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`${API_BASE}/files/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.VUE_APP_DIFY_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  async* streamChat({ query, inputs = {}, fileId, conversationId }) {
    const response = await fetch(`${API_BASE}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VUE_APP_DIFY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        inputs,
        response_mode: 'streaming',
        user: 'user',
        conversation_id: conversationId,
        files: fileId ? [{ 
          transfer_method: 'local_file',
          upload_file_id: fileId 
        }] : []
      })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          yield JSON.parse(line.substring(5))
        }
      }
    }
  }
}
