
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
          <li v-for="(item, index) in currentList" :key="index" @click="inputText = item.text;sendMessage()">{{ item.text }}</li>
        </ul>
    </div>
    </div>
    
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['message', msg.role === 'user' ? 'sent' : 'received']">
        <!-- <div v-if="msg.files" class="file-preview">
          <img v-if="isImage(msg.files[0])" :src="msg.files[0].url">
          <a v-else :href="msg.files[0].url" target="_blank">下载文件</a>
        </div> -->
        <div v-if="loading && index == messages.length - 1" class="message-loading">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
        <div class="bubble" v-html="renderMarkdown(msg.content)"></div>
        <span class="time">{{ msg.time }}</span>
      </div>
    </div>
    
    <div class="input-area">
      <input v-model="inputText" @keyup.enter="sendMessage" placeholder="输入消息...">
      <button class="upload-button" @click.stop="toggleBox"><img class="icon-upload" src="@/assets/upload.png"></button>
      <div v-if="showBox" class="floating-box" ref="box">
        <input type="file" @change="handleFileChange" ref="fileInput">
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

<script>
import DifyService from '../api/difyService'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

export default {
  data() {
    return {
      loading:false,
      contactName:'智能招聘小海',
      currentList:[],
      showBox: false,
      messages: [],
      inputText: '',
      currentFile: null,
      conversationId: null,
      md: new MarkdownIt(),
      typingInterval: null
    }
  },
  beforeUnmount(){
    document.addEventListener('click', this.handleClickOutside)
  },
  mounted(){
    this.refreshList()
    this.scrollToBottom()
    document.addEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleBox(){
      this.showBox = !this.showBox
    },
    refreshList(){
      this.currentList=[
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
    },
    scrollToBottom(){
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        container.scrollTop = container.scrollHeight
      })
    },
    handleClickOutside(event){
      if (this.$refs.box && !this.$refs.box.contains(event.target)) {
        this.showBox = false
      }
    },
    isImage(file) {
      return file?.type?.startsWith('image/')
    },
    renderMarkdown(content) {
      return DOMPurify.sanitize(this.md.render(content || ''))
    },
    handleFileChange(e) {
      this.currentFile = e.target.files[0]
    },
    async sendMessage() {
      if(!this.inputText || this.inputText.trim() === '') {
        return alert('输入内容为空')
      }
      const userMsg = { 
        role: 'user', 
        content: this.inputText,
        files: this.currentFile ? [{
          name: this.currentFile.name,
          type: this.currentFile.type,
          url: URL.createObjectURL(this.currentFile)
        }] : []
      }
      this.messages.push(userMsg)

      const botMsg = { role: 'assistant', content: '' }
      this.messages.push(botMsg)
      this.loading = true

      try {
        let fileId = null
        if (this.currentFile) {
          const uploadRes = await DifyService.uploadFile(this.currentFile)
          fileId = uploadRes.data.id
        }
        
        for await (const chunk of DifyService.streamChat({
          query: this.inputText,
          fileId,
          conversationId: this.conversationId
        })) {
          if (chunk.event === 'message') {
            botMsg.content += chunk.answer
            this.scrollToBottom()
            //this.typeResponse(botMsg, fullText)
          } else if (chunk.event === 'message_end') {
            this.conversationId = chunk.conversation_id
          }
        }
      } catch (error) {
        botMsg.content = `错误: ${error.message}`
      } finally {
        this.loading = false
      }

      this.inputText = ''
      this.currentFile = null
      //this.$refs.fileInput.value = ''
      
    },
    typeResponse(msgObj, fullText) {
        clearInterval(this.typingInterval)
        let content = ''
        this.typingInterval = setInterval(() => {
            if (content.length < fullText.length) {
            content += fullText[content.length]
            msgObj.content = content
            this.$forceUpdate()
            } else {
            clearInterval(this.typingInterval)
            }
        }, 30)
    },
  },
  beforeDestroy() {
    clearInterval(this.typingInterval)
  }
}
</script>
<style scoped>
</style>
