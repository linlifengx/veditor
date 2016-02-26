<template lang="jade">
  open-file-panel(:class="{collapse: collapse}")
    name(@click="onClick") OPEN FILES
    content(:class="{notified: notified}")
      item(v-for="item in items", v-if="!item.isTemp", @click="onItemClick(item)", :class="{active: item.active, dirty: item.isDirty}" )
        |{{item.name}}
        close(@click.stop="onCloseClick(item)")
    save-change-modal(:model="modal")
</template>

<script>
import SaveChangeModal from './SaveChangeModal'
import fileService from '../service/FileService'
import PubSub from 'pubsub-js'
var Promise = window.Promise

export default {
  data () {
    return {
      items: [],
      modal: {show: false, _deferred: null, fileName: null },
      notified: false,
      collapse: false
    }
  },
  methods: {
    onClick () {
      this.collapse = !this.collapse
    },
    onItemClick (item) {
      this.active(item.id)
      PubSub.publish('edit-file')
    },
    onCloseClick (item) {
      this.remove(item)
    },
    modalShow (fileName) {
      var deferred = Promise.defer()
      this.modal.show = true
      this.modal.fileName = fileName
      this.modal._deferred = deferred
      return deferred.promise
    },
    active (id, notified) {
      this.items.forEach(item => {
        if (item.id == id) {
          item.active = true
        } else {
          item.active = false
        }
      })
      this.notified = !!notified
    },
    async remove (item, force) {
      if (force || !item.isDirty) {
        this.items.$remove(item)
        if (this.notified) {
          PubSub.publish('file-closed', item.id)
        }
      } else {
        var result = await this.modalShow(item.name)
        if (result == 1) {
          await fileService.saveFile(item.id, item.content)
          this.items.$remove(item)
        } else if (result == 2) {
          this.items.$remove(item)
        }
        if (this.notified && result == 1 || result == 2) {
          PubSub.publish('file-closed', item.id)
        }
      }
    }
  },
  attached () {
    var items = this.items
    PubSub.subscribe('file-preview', async (msg, {id, name, path}) => {
      var item = items.find(item => item.id == id)
      if (item) {
        this.active(id, true)
      } else {
        var preItem = items.find(item => item.isTemp)
        items.$remove(preItem)
        var content = await fileService.readFile(id)
        items.push({
          id, name, path, content,
          isDirty: false, active: false, preContent: content, isTemp: true
        })
        this.active(id, true)
      }
    })

    PubSub.subscribe('file-open', async (msg, {id, name, path}) => {
      var item = items.find(item => item.id == id)
      if (item) {
        item.isTemp = false
        this.active(id, true)
      } else {
        var content = await fileService.readFile(id)
        items.push({
          id, name, path, content,
          isDirty: false, active: false, preContent: content, isTemp: false
        })
        this.active(id, true)
      }
    })

    PubSub.subscribe('file-renamed', (msg, {id, name}) => {
      var item = items.find(item => item.id == id)
      if (item) {
        var index = item.path.lastIndexOf(item.name)
        item.path = item.path.substr(0,index) + name
        item.name = name
      }
    })

    PubSub.subscribe('folder-renamed', (msg, {oldPath, newPath}) => {
      items.forEach(item => {
        if (item.path.indexOf(oldPath+'/') == 0) {
          item.path = item.path.replace(oldPath, newPath)
        }
      })
    })

    PubSub.subscribe('file-deleted', (msg, id) => {
      var item = items.find(item => item.id == id)
      items.$remove(item)
    })

    PubSub.subscribe('folder-deleted', (msg, path) => {
      console.log(path)
      for (let i=items.length-1; i>=0; i--) {
        if (items[i].path.indexOf(path+'/') == 0) {
          items.$remove(items[i])
        }
      }
    })

    PubSub.subscribe('save-file', async (msg) => {
      var item = items.find(item => item.active && item.isDirty)
      if (item && await fileService.saveFile(item.id, item.content)) {
        item.preContent = item.content
        item.isDirty = false
      }
    })

    PubSub.subscribe('check-save-file', (msg, resolve) => {
      var item = items.find(item => item.active && item.isDirty)
      if (item) {
        resolve(true)
      } else {
        resolve(false)
      }
    })

    function checkEditAction (msg, resolve) {
      var item = items.find(item => item.active)
      if (item) {
        resolve(true)
      } else {
        resolve(false)
      }
    }
    PubSub.subscribe('check-edit-undo', checkEditAction)
    PubSub.subscribe('check-edit-redo', checkEditAction)
    PubSub.subscribe('check-edit-cut', checkEditAction)
    PubSub.subscribe('check-edit-copy', checkEditAction)
    PubSub.subscribe('check-edit-paste', checkEditAction)
    PubSub.subscribe('check-edit-select-all', checkEditAction)

    PubSub.subscribe('get-open-files', function (msg, setter) {
      setter(items)
    })
  },
  components: {
    SaveChangeModal
  }
}
</script>
