import Vue from 'vue'
import App from './App'

new Vue({
  el: 'body',
  components: { App }
})

document.addEventListener('contextmenu', function (e) {
  e.preventDefault()
})
