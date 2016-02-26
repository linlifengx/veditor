<template lang="jade">
  file(:class="{expand: node.expand, active: node.active}")
    name(@click="onClick", @dblclick="onDblclick", @contextmenu="onContextMenu") {{node.name}}
    template(v-if="node.isFolder")
      children
        file-tree(v-for="subNode in node.children", :node="subNode")
</template>

<script>
export default {
  name: 'file-tree',
  props: ['node'],
  methods: {
    onClick (e) {
      if (this.node.isFolder) {
        this.node.expand = !this.node.expand
      }
      this.$dispatch('node-click', [], e)
    },
    onDblclick (e) {
      if (!this.node.isFolder) {
        this.$dispatch('node-dblclick', this.node)
      }
    },
    onContextMenu (e) {
      this.$dispatch('node-contextmenu', [], e)
    }
  },
  events: {
    'node-click' (nodes, e) {
      nodes.unshift(this.node)
      return true
    },
    'node-contextmenu' (nodes, e) {
      nodes.unshift(this.node)
      return true
    }
  }
}
</script>
