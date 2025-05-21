<template>
  <div id="app">
    <ChatApp v-if="false"/>
    <TypeWriter />
  </div>
</template>

<script>
import ChatApp from './components/ChatApp.vue'
import TypeWriter from './components/TypeWriter.vue'
export default {
  name: 'App',
  components: {
    ChatApp,
    TypeWriter
  }
}
</script>

<style>
</style>
