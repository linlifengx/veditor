<template lang="jade">
  editor-panel
    //file-name(v-for="f in files", v-if="f.active", :class="{active: f.active}") {{f.name}}
    edit-panel
      ace-editor(v-for="f in files", :class="{active: f.active}", :file="f")
</template>

<script>
import AceEditor from './AceEditor'
import PubSub from 'pubsub-js'
export default {
  data () {
    return {
      files: null
    }
  },
  attached () {
    PubSub.publish('get-open-files', (files) => {
      this.files = files
    })
  },
  components: {
    AceEditor
  }
}
</script>
