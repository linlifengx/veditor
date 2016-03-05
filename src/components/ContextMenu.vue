<template lang="jade">
  menu(v-show="model.show", class="context-menu", :style="{position: 'fixed',\
   zIndex: 600, left: model.position.x+'px', top: model.position.y+'px'}")
    template(v-for="item in model.menu")
      item(@click="onItemClick(item)")
        text {{item.text}}
</template>

<script>
import PubSub from 'pubsub-js'

export default {
  props: ['model'],
  data () {
    return {
      clicked: false
    }
  },
  attached () {
    this.documentClick = (e) => {
      if (!this.model.show) {
        return
      }
      if (!this.clicked) {
        this.reset()
      }
      this.clicked = false
    }
    document.addEventListener('click', this.documentClick)
  },
  destroyed () {
    document.removeEventListener('click', this.documentClick)
  },
  methods: {
    reset () {
      this.model.show = false
      this.model.menu = null
    },
    onItemClick (item) {
      var action = item.action
      this.clicked = true
      this.reset()
      PubSub.publishSync(action)
    }
  }
}
</script>
