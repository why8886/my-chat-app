<template>
  <div class="workflow-container">
    <div ref="outputBox" class="stream-output"></div>
    <button @click="startWorkflow" :disabled="loading">
      {{ loading ? '运行中...' : '执行工作流' }}
    </button>
    <button @click="abortWorkflow" v-show="loading">中止</button>
  </div>
</template>

<script>
import request from '@/utils/request'

class WorkflowStreamHandler {
  constructor(container) {
    this.container = container
    this.buffer = ''
    this.typingSpeed = 40
    this.activeNodes = new Map()
  }

  processChunk(chunk) {
    this.buffer += chunk
    const events = this.buffer.split('\n\ndata: ')
    this.buffer = events.pop() || ''

    events.forEach(rawEvent => {
      try {
        const eventData = rawEvent.trim()
        this.renderEvent(eventData)
      } catch (e) {
        console.error('事件解析失败:', e)
      }
    })
  }

  renderEvent(event) {
    const nodeStatus = {
      'workflow_started': '🏁 工作流开始',
      'node_started': '▶️ 节点启动',
      'node_finished': '✅ 节点完成'
    }[event.event]

    const content = `
      <div class="event ${event.event}">
        <span class="timestamp">${new Date(event.created_at * 1000).toLocaleTimeString()}</span>
        <span class="event-type">${nodeStatus}</span>
        ${this.formatEventDetails(event)}
      </div>
    `
    
    this.typewriterEffect(content)
  }

  formatEventDetails(event) {
    const details = {
      node_id: event.data?.node_id,
      node_type: event.data?.node_type,
      elapsed_time: event.data?.elapsed_time ? `${event.data.elapsed_time}s` : null
    }
    return `<pre>${JSON.stringify(details, null, 2)}</pre>`
  }

  typewriterEffect(text) {
    let i = 0
    const outputDiv = this.container
    const timer = setInterval(() => {
      if (i < text.length) {
        outputDiv.innerHTML += text.charAt(i)
        outputDiv.scrollTop = outputDiv.scrollHeight
        i++
      } else {
        clearInterval(timer)
      }
    }, this.typingSpeed)
  }
}

export default {
  data() {
    return {
      loading: false,
      controller: null,
      streamHandler: null
    }
  },
  mounted() {
    this.streamHandler = new WorkflowStreamHandler(this.$refs.outputBox)
  },
  methods: {
    async startWorkflow() {
      this.loading = true
      this.controller = new AbortController()
      console.log(this.controller,'312')

      try {
        const response = await request.post('/chat-messages', {
          "response_mode":"streaming",
          "conversation_id":"eab611f0-754c-4ddc-a0b2-2ef5248f8ba6",
          "files":[{"type":"document","transfer_method":"local_file","url":"",
          "upload_file_id":"dc8fee18-3545-4d65-aecd-92fe41b25c96"}],
          "query": '21',
          "inputs": {},
          "parent_message_id":"3e7f027b-26e6-45ee-afaf-a4b2c302be02"
        }, {
          signal: this.controller.signal,
          onDownloadProgress: progressEvent => {
            console.log(progressEvent,'33333333333')
            const chunk = progressEvent.target.responseText
            this.streamHandler.processChunk(chunk)
          }
        })
        console.log(response)
      } catch (e) {
        console.error('工作流执行异常:', e)
      } finally {
        this.loading = false
      }
    },
    abortWorkflow() {
      if (this.controller) {
        this.controller.abort()
        this.$refs.outputBox.innerHTML += '<div class="warning">⏹️ 用户手动终止工作流</div>'
      }
    }
  },
  beforeDestroy() {
    this.abortWorkflow()
  }
}
</script>

<style>
.workflow-container {
  margin: 0 auto;
}
.stream-output {
  max-height: 1000px;
  padding: 0;
  overflow-y: auto;
}
.event {
  margin: 10px 0;
  padding: 15px;
  border-left: 4px solid #2196F3;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.event-type {
  color: #2196F3;
  margin-left: 10px;
}
.timestamp {
  color: #333;
  font-size: 0.9em;
}
pre {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.warning {
  color: #ff5722;
  padding: 10px;
  border-left: 4px solid #ff5722;
}
</style>
