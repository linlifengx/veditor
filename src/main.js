import './promise-defer'
import Vue from 'vue'
import App from './App'

var contextMenuFired = false
document.addEventListener('contextmenu', function (e) {
  contextMenuFired = true
  e.preventDefault()
})

document.addEventListener('mouseup', function (e) {
  setTimeout(function () {
    contextMenuFired = false
  }, 0)
})

document.addEventListener('click', function (e) {
  if (contextMenuFired) {
    e.stopImmediatePropagation()
  }
}, true)


new Vue({
  el: 'body',
  components: { App }
})

if ('serviceWorker' in navigator) {
 console.log('Service Worker is supported');
 navigator.serviceWorker.register('preview.js', {scope: './preview/'}).then(function(reg) {
   console.log(':^)', reg);
 }).catch(function(err) {
   console.log(':^(', err);
 });
}
