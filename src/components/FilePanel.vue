<template lang="jade">
  file-panel(:class="{collapse: collapse}")
    name(@contextmenu="onContextMenu", @click="onClick") FILES
    content
      files
        file-tree(v-for="node in fileTree.children", :node="node")
    file-name-modal(:model="fileNameModal")
    context-menu(:model="contextMenu")
</template>

<script>
import FileTree from './FileTree'
import FileNameModal from './FileNameModal'
import ContextMenu from './ContextMenu'
import fileService from '../service/FileService'
import PubSub from 'pubsub-js'
var Promise = window.Promise

var rootContextMenu = [
  {text: 'New Folder', action: 'action-new-folder'},
  {text: 'New File', action: 'action-new-file'}
]

var fileContextMenu = [
  {text: 'Rename', action: 'action-rename-file'},
  {text: 'Delete', action: 'action-delete-file'}
]

var folderContextMenu = [...rootContextMenu, ...fileContextMenu]

export default {
  data () {
    var fileTree = {
      id: fileService.rootId,
      name: '',
      isFolder: true,
      isLoaded: false,
      expand: true,
      active: false,
      children: []
    }
    var selectNodes = [fileTree]

    return {
      fileTree,
      selectNodes,
      fileNameModal: {show: false, name: null, path: null, notAllowNames: null},
      contextMenu: {show: false, menu: [], position: {x:0, y:0}},
      collapse: false
    }
  },
  methods: {
    onContextMenu (e) {
      this.setSelectNodes([this.fileTree])
      this.showContexmenu(e)
    },
    onClick () {
      this.collapse = !this.collapse
    },

    setSelectNodes (nodes) {
      this.selectNodes[this.selectNodes.length-1].active = false
      this.selectNodes = nodes || [this.fileTree]
      nodes[nodes.length - 1].active = true
    },
    getSelectPath () {
      return this.selectNodes.map(n => n.name).join('/')
    },
    newNameModal () {
      var path = this.selectNodes.filter(n => n.isFolder).map(n => n.name).join('/')
      var name = 'untitled'
      var folderNode = this.selectNodes[this.selectNodes.length-1]
      if (!folderNode.isFolder) {
        folderNode = this.selectNodes[this.selectNodes.length-2]
      }
      var notAllowNames = folderNode.children.map(n => n.name)
      var deferred = Promise.defer()
      this.fileNameModal.name = name
      this.fileNameModal.path = path
      this.fileNameModal._deferred = deferred
      this.fileNameModal.notAllowNames = notAllowNames
      this.fileNameModal.show = true
      return deferred.promise
    },
    renameModal () {
      var path = this.selectNodes.slice(0,this.selectNodes.length-1).map(n => n.name).join('/')
      var name = this.selectNodes[this.selectNodes.length-1].name
      var notAllowNames = this.selectNodes[this.selectNodes.length-2].children.map(n => n.name)
      var deferred = Promise.defer()
      this.fileNameModal.name = name
      this.fileNameModal.path = path
      this.fileNameModal._deferred = deferred
      this.fileNameModal.notAllowNames = notAllowNames
      this.fileNameModal.show = true
      return deferred.promise
    },
    async newFile (isFolder) {
      var name = await this.newNameModal()
      if (!name) {
        return
      }
      var folderNode = this.selectNodes[this.selectNodes.length-1]
      if (!folderNode.isFolder) {
        folderNode = this.selectNodes[this.selectNodes.length-2]
      }
      var id = await fileService.newFile(folderNode.id, name, !!isFolder)
      var newNode = null
      if (isFolder) {
        newNode = {id, name, isFolder: true, active: true, isLoaded: true, expand: true, children:[]}
      } else {
        newNode = {id, name, isFolder: false, active: true}
      }
      folderNode.children.push(newNode)
      var oldActiveNode = this.selectNodes[this.selectNodes.length-1]
      oldActiveNode.active = false
      if (oldActiveNode.isFolder) {
        this.selectNodes.push(newNode)
      } else {
        this.selectNodes[this.selectNodes.length-1] = newNode
      }
      if (!isFolder) {
        PubSub.publish('file-open', {id, name, path: this.getSelectPath()})
      }
    },
    async newFolder () {
      return await this.newFile(true)
    },
    async deleteFile () {
      if (this.selectNodes.length <= 1) {
        return
      }
      var node = this.selectNodes[this.selectNodes.length - 1]
      var folderNode = this.selectNodes[this.selectNodes.length - 2]
      var sure = window.confirm(`Delete ${node.name}?`)
      if (sure && await fileService.deleteFile(folderNode.id, node.id)) {
        var path = this.getSelectPath()
        folderNode.children.$remove(node)
        this.selectNodes.pop()
        folderNode.active = true
        if (node.isFolder) {
          PubSub.publish('folder-deleted', path)
        } else {
          PubSub.publish('file-deleted', node.id)
        }
      }
    },
    async renameFile () {
      if (this.selectNodes.length <= 1) {
        return
      }
      var name = await this.renameModal()
      var node = this.selectNodes[this.selectNodes.length - 1]
      var folderNode = this.selectNodes[this.selectNodes.length - 2]
      if (name && await fileService.renameFile(folderNode.id, node.id, name)) {
        if (node.isFolder) {
          var oldPath = this.getSelectPath()
          node.name = name
          PubSub.publish('folder-renamed', {oldPath, newPath: this.getSelectPath()})
        } else {
          node.name = name
          PubSub.publish('file-renamed', {id: node.id, name})
        }
      }
    },
    showContexmenu (e) {
      if (this.selectNodes.length <= 1) {
        this.contextMenu.menu = rootContextMenu
      } else if (this.selectNodes[this.selectNodes.length-1].isFolder) {
        this.contextMenu.menu = folderContextMenu
      } else {
        this.contextMenu.menu = fileContextMenu
      }
      this.contextMenu.position = {x: e.pageX, y: e.pageY}
      this.contextMenu.show = true
    },
    async loadFolder (node) {
      var content = await fileService.readFile(node.id)
      content.forEach(f => {
        if (f.isFolder) {
          node.children.push({...f, isLoaded: false, expand: false, children:[], active: false})
        } else {
          node.children.push({...f, active: false})
        }
      })
      node.isLoaded = true
    }
  },
  attached () {
    (async () => {
      await fileService.ready()
      this.loadFolder(this.fileTree)
    })()

    PubSub.subscribe('action-new-file', () => this.newFile())
    PubSub.subscribe('action-new-folder', () => this.newFolder())
    PubSub.subscribe('action-rename-file', () => this.renameFile())
    PubSub.subscribe('action-delete-file', () => this.deleteFile())
    PubSub.subscribe('edit-file', () => this.setSelectNodes([this.fileTree]))
    PubSub.subscribe('check-action-rename-file', (msg, resolve) => {
      resolve(this.selectNodes.length > 1)
    })
    PubSub.subscribe('check-action-delete-file', (msg, resolve) => {
      resolve(this.selectNodes.length > 1)
    })
    PubSub.subscribe('file-closed', (msg, id) => {
      if (this.selectNodes[this.selectNodes.length-1].id == id) {
        this.setSelectNodes([this.fileTree])
      }
    })
  },
  components: {
    FileTree,
    FileNameModal,
    ContextMenu
  },
  events: {
    async 'node-click' (nodes, e) {
      nodes.unshift(this.fileTree)
      this.setSelectNodes(nodes)
      var node = nodes[nodes.length-1]
      if (!node.isFolder) {
        PubSub.publish('file-preview', {id: node.id, name: node.name, path: this.getSelectPath()})
      } else if (!node.isLoaded) {
        this.loadFolder(node)
      }
    },
    'node-dblclick' (node) {
      if (!node.isFolder) {
        var path = this.selectNodes.map(f => f.name).join('/')
        PubSub.publish('file-open', {id: node.id, name: node.name, path: this.getSelectPath()})
      }
    },
    'node-contextmenu' (nodes, e) {
      nodes.unshift(this.fileTree)
      this.setSelectNodes(nodes)
      this.showContexmenu(e)
    }
  }
}
</script>
