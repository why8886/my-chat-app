import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './styles/styles.css'
import DifyPlugin from './plugins/dify-chat'
import FileUpload from './components/FileUpload.vue'
import SSEComponent from './components/SSEComponent.vue'

Vue.config.productionTip = false
Vue.use(DifyPlugin)
Vue.component('FileUpload', FileUpload)
Vue.component('SSEComponent', SSEComponent)


Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
