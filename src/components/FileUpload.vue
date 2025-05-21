
<template>
  <div class="upload-container">
    <input 
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      @change="handleFileChange"
      class="hidden-input"
      multiple
    />
    <div 
      @click="triggerFileInput"
      class="upload-area"
      :class="{ 'dragover': isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <slot>
        <div class="default-content">
          <i class="upload-icon"></i>
          <p>点击或拖拽文件到此处</p>
        </div>
      </slot>
    </div>
    
    <div v-if="files.length" class="file-list">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatSize(file.size) }}</span>
        </div>
        <div class="progress-container">
          <div 
            class="progress-bar" 
            :style="{ width: file.progress + '%' }"
          ></div>
        </div>
        <button @click="removeFile(index)" class="remove-btn">×</button>
      </div>
    </div>

    <button 
      @click="uploadFiles" 
      :disabled="!files.length || isUploading"
      class="upload-btn"
    >
      {{ isUploading ? `上传中...` : `开始上传` }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    acceptTypes: {
      type: String,
      default: 'image/*,video/*,application/pdf'
    },
    maxSize: {
      type: Number,
      default: 20 * 1024 * 1024 // 20MB
    },
    multiple: {
      type: Boolean,
      default: true
    },
    action: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      files: [],
      isUploading: false,
      isDragging: false
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileChange(e) {
      this.addFiles([...e.target.files])
      e.target.value = '' // 允许重复选择相同文件
    },
    handleDragOver() {
      this.isDragging = true
    },
    handleDragLeave() {
      this.isDragging = false
    },
    handleDrop(e) {
      this.isDragging = false
      this.addFiles([...e.dataTransfer.files])
    },
    addFiles(newFiles) {
      const validFiles = newFiles.filter(file => {
        if (file.size > this.maxSize) {
          this.$emit('error', {
            type: 'size',
            file,
            message: `文件大小超过${this.formatSize(this.maxSize)}限制`
          })
          return false
        }
        return true
      })
      
      this.files = [
        ...this.files,
        ...validFiles.map(file => ({
          raw: file,
          name: file.name,
          size: file.size,
          progress: 0
        }))
      ]
    },
    async uploadFiles() {
      if (this.isUploading) return
      
      this.isUploading = true
      const uploadPromises = this.files.map((file, index) => {
        const formData = new FormData()
        formData.append('file', file.raw)
        
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100)
              this.$set(this.files[index], 'progress', progress)
            }
          }
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response)
            } else {
              reject(xhr.statusText)
            }
          }
          
          xhr.onerror = () => reject('上传失败')
          xhr.open('POST', this.action, true)
          xhr.send(formData)
        })
      })
      
      try {
        await Promise.all(uploadPromises)
        this.$emit('success', this.files)
        this.files = []
      } catch (error) {
        this.$emit('error', { type: 'upload', error })
      } finally {
        this.isUploading = false
      }
    },
    removeFile(index) {
      this.files.splice(index, 1)
    },
    formatSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.upload-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
.hidden-input {
  display: none;
}
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}
.upload-area.dragover {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}
.default-content {
  color: #666;
}
.upload-icon {
  display: block;
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  background: url('data:image/svg+xml;utf8,<svg ...>') no-repeat center;
}
.file-list {
  margin-top: 20px;
}
.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.file-info {
  flex: 1;
  min-width: 0;
}
.file-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-size {
  font-size: 12px;
  color: #999;
}
.progress-container {
  width: 80px;
  height: 4px;
  background: #eee;
  margin: 0 10px;
  border-radius: 2px;
}
.progress-bar {
  height: 100%;
  background: #409eff;
  border-radius: 2px;
  transition: width 0.3s;
}
.remove-btn {
  border: none;
  background: none;
  font-size: 20px;
  color: #f56c6c;
  cursor: pointer;
}
.upload-btn {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.upload-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}
</style>
