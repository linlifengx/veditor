<template lang="jade">
resize-bar(@mousedown="onMousedown")

</template>
<script>
export default {
  data () {
    return {
      active: false,
      beginWidth: 0,
      minWidth: 250,
      maxWidth: 600,
      beginX: 0
    }
  },
  methods: {
    onMousedown (e) {
      this.active = true
      this.beginWidth = this.$el.previousElementSibling.offsetWidth
      this.beginX = e.pageX
      document.body.classList.add('resize-moving')
    }
  },
  attached () {
    document.addEventListener('mousemove', (e) => {
      if (this.active) {
        var movement = e.pageX - this.beginX
        var width = this.beginWidth + movement
        if (width < this.minWidth) {
          width = this.minWidth
        } else if (width > this.maxWidth) {
          width = this.maxWidth
        }
        this.$el.previousElementSibling.style.width = width + 'px'
      }
    })
    document.addEventListener('mouseup', () => {
      this.active = false
      this.beginX = 0
      this.beginWidth = 0
      document.body.classList.remove('resize-moving')
    })
  }
}
</script>
