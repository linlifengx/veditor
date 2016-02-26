<template lang="jade">
  layer(v-show="model.show")
    modal
      content
        |{{model.path}}/&nbsp;
        input(v-model="model.name", v-el:input)
      footer
        button.right.blue(@click="onOkClick") 确定
        button.right(@click="onCancelClick") 取消

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
        this.onOkClick()
      }
      if (e.keyCode == 27) {
        this.onCancelClick()
      }
    })
  },
  methods: {
    reset () {
      this.model.show = false
      this.model.name = null
      this.model.notAllowNames = null
      this.model._deferred = null
    },
    onCancelClick () {
      if (this.model._deferred) {
        this.model._deferred.resolve(false)
      }
      this.reset()
    },
    onOkClick () {
      var model = this.model
      if (model.name == '') {
        alert('please input file/folder name')
      } else if (model.notAllowNames && model.notAllowNames.indexOf(model.name) > -1){
        alert(`file ${model.name} exist`)
      } else {
        model._deferred.resolve(model.name)
        this.reset()
      }
    }
  },
  watch: {
    'model.show' (val) {
      if (val) {
        this.$els.input.focus()
      }
    }
  }
}
</script>
