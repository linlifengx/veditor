<template lang="jade">
  template(v-if="typeof model == 'string'")
    separator
  template(v-else)
    item(:class="{active: model.active, disable: !model.enable}")
      text(@mouseenter="onHover" @click="onClick") {{model.text}}
      template(v-if="model.children")
        menu
          template(v-for="sub in model.children")
            menu-item(:model="sub")
</template>

<script>

export default {
  name: 'menu-item',
  props: ['model'],
  methods: {
    onHover () {
      this.$dispatch('item-hover', [])
    },
    onClick () {
      if (this.model.enable) {
        this.$dispatch('item-click', this.model)
      }
    }
  },
  events: {
    'item-hover' (items) {
      items.push(this.model)
      return true
    }
  }
}
</script>
