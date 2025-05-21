
<template>
  <div class="chat-container">
    <div class="header">
      <img class="logo" alt="logo" src="@/assets/logo.png">
    </div>

    <div class="welcome">
      <img class="xiaohai" alt="小海" src="@/assets/xiaohai1.png">
      <h3>Hi，我是{{ contactName }}!</h3>
      <p>快来和我互动吧～</p>
      <div class="questions-container">
        您可能想问：
        <button class="change-list-button" @click="refreshList">
          <img class="icon" alt="小海" src="@/assets/huanyihuan.png">换一换
        </button>
        <ul class="questions-list">
          <li v-for="(item, index) in currentList" :key="index" @click="setMessageAndSend(item.text)">{{ item.text }}</li>
        </ul>
    </div>
    </div>

    
    
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['message', msg.sender === 'me' ? 'sent' : 'received']">

        <div class="bubble">{{ msg.text }}<SSEComponent/></div>
        <span class="time">{{ msg.time }}</span>
      </div>
    </div>
    
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="输入消息...">
      <button class="upload-button" @click.stop="toggleBox"><img class="icon-upload" src="@/assets/upload.png"></button>
      <div v-if="showBox" class="floating-box" ref="box">
        <file-upload
          :acceptTypes="'application/*'"
          action="/files/upload"
          @success="handleUploadSuccess"
          @error="handleUploadError"
        >
          <template #default>
            <div class="custom-prompt">
              <i class="custom-icon"></i>
              <p>点击选择或拖放文件到此处</p>
              <small>支持DOC、XLS、PDF、ZIP，最大20MB</small>
            </div>
          </template>
        </file-upload>
      </div>
      <button @click="sendMessage">  
        <img class="icon-send" src="@/assets/send.png">      
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {getMessage} from '@/api/index'


const contactName = ref('智能招聘小海')
const newMessage = ref('')
const messagesContainer = ref(null)
const messages = ref([
  // { text: '你好呀！', sender: 'other', time: '10:30' },
  // { text: '最近怎么样？', sender: 'me', time: '10:32' }
])
const currentList = ref([])

const refreshList = () => {
  currentList.value = [
    { text:'帮我推荐几个五年工作经验的JAVA后端开发?' },
    { text:'帮我推荐几个三年工作经验的配置管理人员?' },
    { text:'帮我推荐几个三年工作经验的需求设计人员?' },
    { text:'帮我推荐几个有管理经验的技术经理人才?' },
    { text:'帮我筛选下工作地点为南京的实施岗位人员?' },
    { text:'帮我推荐几个精通VUE相关技术的前端开发?' },
    { text:'哪些人才精通kubernetes等容器化相关技术?' },
    { text:'帮我筛选下工作地点为河南的实施岗位人员?' },
    { text:'帮我筛选下工作地点为福建的实施岗位人员?' },
  ].sort(() => 0.5 - Math.random()).slice(0, 5)
}

const showBox = ref(false)
const box = ref(null)

const toggleBox = () => {
  showBox.value = !showBox.value
}

const handleClickOutside = (event) => {
  if (box.value && !box.value.contains(event.target)) {
    showBox.value = false
  }
}


const sendMessage = () => {
  if (newMessage.value.trim()) {
    getMessage({
      "response_mode":"streaming",
      "conversation_id":"eab611f0-754c-4ddc-a0b2-2ef5248f8ba6",
      "files":[{"type":"document","transfer_method":"local_file","url":"",
      "upload_file_id":"dc8fee18-3545-4d65-aecd-92fe41b25c96"}],
      "query": newMessage.value + '',
      "inputs": {},
      "parent_message_id":"3e7f027b-26e6-45ee-afaf-a4b2c302be02"
    }).then(async (response) => {
      const reader = response.body.getReader();
    const decoder = new TextDecoder();
const isRunninhg = true;
    while (isRunninhg) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const events = chunk.trim().split('\n\n');

      events.forEach(event => {
        if (event.startsWith('data:')) {
          const jsonStr = event.slice(5).trim();
          try {
            const data = JSON.parse(jsonStr);
            processEvent(data); // 自定义事件处理器
          } catch (e) {
            console.error('JSON解析失败:', e);
          }
        }
      });
    }
    })
    messages.value.push({
      text: newMessage.value,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    })
    newMessage.value = ''
    scrollToBottom()
    simulateReply()
  }
}
const processEvent = (data) => {
  switch (data.event) {
    case 'workflow_started':
      console.log('工作流启动:', data.data.workflow_id);
      break;
    case 'node_finished':
      console.log(`节点完成[${data.data.node_type}]:`, data.data.status);
      break;
    // 其他事件类型...
  }
};
const setMessageAndSend = (msg) => {
  newMessage.value = msg
  sendMessage()
}

const simulateReply = () => {
  setTimeout(() => {
    messages.value.push({
      text: '该岗位要求3年以上前端开发经验',
      sender: 'other',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    })
    scrollToBottom()
  }, 1500)
}

const scrollToBottom = () => {
  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

const handleUploadSuccess = (files) => {
  alert(`成功上传 ${files.length} 个文件`)
}
const handleUploadError =  (error) => {
  alert(`上传错误: ${error.message || error}`)
}

onMounted(() => {
  refreshList()
  scrollToBottom()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
</style>
