import Vue from 'vue'
import App from './App'

new Vue({
  el: 'body',
  components: { App }
})

document.addEventListener('contextmenu', function (e) {
  e.preventDefault()
})

if ('serviceWorker' in navigator) {
 console.log('Service Worker is supported');
 navigator.serviceWorker.register('preview.js', {scope: './preview/'}).then(function(reg) {
   console.log(':^)', reg);
 }).catch(function(err) {
   console.log(':^(', err);
 });
}
