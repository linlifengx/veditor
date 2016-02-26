import DB from './DB'
var Promise = window.Promise

export default {
  rootId: DB.rootId,

  ready () {
    return DB.ready()
  },

  async readFile (id) {
    var record = await DB.readFile(id)
    return record.content
  },

  async newFile (folderId, name, isFolder) {
    var newRecord = await DB.storeFile({content: isFolder ? [] : ''})
    var folderRecord = await DB.readFile(folderId)
    folderRecord.content.push({id: newRecord.id, name, isFolder})
    await DB.storeFile(folderRecord)
    return newRecord.id
  },

  async renameFile (folderId, fileId, name) {
    var folderRecord = await DB.readFile(folderId)
    folderRecord.content.find(f => f.id == fileId && (f.name = name))
    await DB.storeFile(folderRecord)
    return true
  },

  async deleteFile (folderId, fileId) {
    var folderRecord = await DB.readFile(folderId)
    var isFolder = false
    folderRecord.content = folderRecord.content.filter(f => {
      if (f.id != fileId) {
        return true
      } else {
        isFolder = f.isFolder
        return false
      }
    })
    await DB.storeFile(folderRecord)
    if (isFolder) {
      DB.removeFolder(fileId)
    } else {
      DB.removeFile(fileId)
    }
    return true
  },

  async saveFile (id, content) {
    var record = {id, content}
    await DB.storeFile(record)
    return true
  }
}
