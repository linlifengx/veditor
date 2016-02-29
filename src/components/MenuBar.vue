<template lang="jade">
  menu-bar(:class="{active: active}" @click="onClick")
    template(v-for="menu in menus")
      menu-item(:model="menu")
    a(href="https://github.com/linlifengx/veditor", target="_blank") Fork me on GitHub
</template>

<script>
import MenuItem from './MenuItem'
import PubSub from 'pubsub-js'

export default {
  data () {
    return {
      clicked: false,
      hoverItems: [],
      active: false,
      menus: [
        {text: 'File', active: false, enable: true, children: [
          {text: 'New File', active: false, enable: true, noCheck: true, action: 'action-new-file'},
          {text: 'New Folder', active: false, enable: true, noCheck: true, action: 'action-new-folder'},
          {text: 'Rename File', active: false, enable: true, action: 'action-rename-file'},
          {text: 'Delete File', active: false, enable: true, action: 'action-delete-file'},
          '-------------------------',
          {text: 'Save File', active: false, enable: false, action: 'save-file'}
        ]},
        {text: 'Edit', active: false, enable: true, children: [
          {text: 'Undo', active: false, enable: false, action: 'edit-undo'},
          {text: 'Redo', active: false, enable: false, action: 'edit-redo'},
          '-------------------------',
          {text: 'Cut', active: false, enable: false, action: 'edit-cut'},
          {text: 'Copy', active: false, enable: false, action: 'edit-copy'},
          {text: 'Paste', active: false, enable: false, action: 'edit-paste'},
          {text: 'Select All', active: false, enable: false, action: 'edit-select-all'}
        ]}
      ]
    }
  },
  methods: {
    onClick () {
      this.clicked = true
    },
    setHoverItems (items) {
      this.hoverItems.forEach(item => item.active = false)
      items.forEach(item => item.active = true)
      this.hoverItems = items
      var lastItem = this.hoverItems[this.hoverItems.length-1]
      if (lastItem && lastItem.children) {
        lastItem.children.forEach(item => {
          if (item.action == null || item.noCheck) {
            return
          }
          var enable = false
          PubSub.publishSync('check-'+item.action, function (result) {
            enable = enable || result
          })
          item.enable = enable
        })
      }
    }
  },
  attached () {
    document.addEventListener('click', () => {
      if (!this.clicked) {
        this.active = false
        this.setHoverItems([])
      }
      this.clicked = false
    }, false)
  },
  events: {
    'item-hover' (items) {
      this.setHoverItems(items)
    },
    'item-click' (item) {
      if (item.children) {
        item.active = true
        this.active = true
      } else {
        this.active = false
        this.setHoverItems([])
        PubSub.publish(item.action)
      }
    }
  },
  components: {
    MenuItem
  }
}
</script>
