
<template>
  <div class="chat-container">
    <div class="message-list">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['message', msg.role]">
        <div v-if="msg.type === 'text'">{{ msg.content }}</div>
        <div v-else-if="msg.type === 'file'" class="file-message">
          <a :href="msg.fileUrl" target="_blank">{{ msg.fileName }}</a>
        </div>
      </div>
    </div>

    <div class="input-area">
      <input type="file" ref="fileInput" @change="handleFileChange" style="display:none">
      <button @click="triggerFileInput">上传文件</button>
      <input v-model="inputText" @keyup.enter="sendTextMessage" placeholder="输入消息...">
      <button @click="sendTextMessage">发送</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputText: '',
      messages: [],
      selectedFile: null
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(e) {
      this.selectedFile = e.target.files[0];
      this.uploadFile();
    },
    async uploadFile() {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await this.$dify.uploadFile(formData);
        this.messages.push({
          role: 'user',
          type: 'file',
          fileName: this.selectedFile.name,
          fileUrl: response.data.file_url
        });
      } catch (error) {
        console.error('文件上传失败:', error);
      }
    },
    async sendTextMessage() {
      if (!this.inputText.trim()) return;
      
      this.messages.push({
        role: 'user',
        type: 'text',
        content: this.inputText
      });

      try {
        const response = await this.$dify.sendMessage({
          query: this.inputText,
          files: this.messages
            .filter(m => m.type === 'file')
            .map(m => ({ url: m.fileUrl }))
        });
        
        this.messages.push({
          role: 'ai',
          type: 'text',
          content: response.data.answer
        });
      } catch (error) {
        console.error('消息发送失败:', error);
      }
      
      this.inputText = '';
    }
  }
}
</script>

<style scoped>
.chat-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 500px;
  display: flex;
  flex-direction: column;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.message {
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
}
.user {
  background: #e3f2fd;
  margin-left: auto;
}
.ai {
  background: #f5f5f5;
  margin-right: auto;
}
.file-message a {
  color: #2196F3;
  text-decoration: none;
}
.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}
input[type="text"] {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  margin-left: 8px;
  padding: 8px 16px;
}
</style>
