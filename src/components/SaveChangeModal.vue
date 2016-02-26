<template lang="jade">
  layer(v-show="model.show")
    modal
      header Save Changes
      content
        |'{{model.fileName}}' has changes, do you want to save them?
      footer
        button(@click="onDontSaveClick") Don't Save
        button.right.blue(@click="onSaveClick") Save
        button.right(@click="onCancelClick") Cancel

</template>

<script>
  export default {
    props: ['model'],
    attached () {
      document.addEventListener('keyup', (e) => {
        if (!this.model.show) {
          return
        }
        if (e.keyCode == 13) {
          this.onSaveClick()
        }
        if (e.keyCode == 27) {
          this.onCancelClick()
        }
      })
    },
    methods: {
      reset () {
        this.model.show = false
        this.model.callback = null
        this.model._deferred = null
      },
      onCancelClick () {
        if (this.model._deferred) {
          this.model._deferred.resolve(0)
        }
        this.reset()
      },
      onSaveClick () {
        if (this.model._deferred) {
          this.model._deferred.resolve(1)
        }
        this.reset()
      },
      onDontSaveClick () {
        if (this.model._deferred) {
          this.model._deferred.resolve(2)
        }
        this.reset()
      }
    }
  }
</script>
