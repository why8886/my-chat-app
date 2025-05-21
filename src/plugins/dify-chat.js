
import axios from 'axios';

const DifyClient = axios.create({
  baseURL: process.env.VUE_APP_DIFY_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.VUE_APP_DIFY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export default {
  install(Vue) {
    Vue.prototype.$dify = {
      async sendMessage(payload) {
        return DifyClient.post('/chat-messages', payload);
      },
      setupSSE(conversationId, callback) {
        const eventSource = new EventSource(
          `${process.env.VUE_APP_DIFY_API_URL}/stream?conversation_id=${conversationId}`
        );
        eventSource.onmessage = (event) => callback(JSON.parse(event.data));
        return eventSource;
      }
    };
  }
};
