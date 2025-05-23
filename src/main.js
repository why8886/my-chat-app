import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './styles/styles.css'
import axios from 'axios'
import { marked } from 'marked';
import DOMPurify from 'dompurify'
import FileUpload from './components/FileUpload.vue'

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$md = {
  render: (text) => DOMPurify.sanitize(marked(text))
}
Vue.component('FileUpload', FileUpload)

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
