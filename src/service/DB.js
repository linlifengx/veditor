/*
数据结构
{id, content}
文件的content是字符串
目录的content是数组
[{id, isFolder, name}...]
*/

const DB_NAME = 'seditor'
const DB_VERSION = 1
const FILE_STORE_NAME = 'file_store'
const FILE_ROOT_KEY = 'root'
var Promise = window.Promise

var db = null
var readyDeferred = Promise.defer();

(function () {
  var req = indexedDB.open(DB_NAME, DB_VERSION)
  req.onsuccess = function (e) {
    db = this.result
    readyDeferred.resolve()
  }
  req.onerror = function (e) {
    alert(`initDB error: ${e.target.error.message}`)
  }
  req.onupgradeneeded = function (e) {
    db = this.result
    //db.deleteObjectStore(FILE_STORE_NAME)
    var fileStore = db.createObjectStore(FILE_STORE_NAME, {keyPath: 'id', autoIncrement: true})
    var root = {
      id: FILE_ROOT_KEY,
      content: []
    }
    fileStore.add(root)
  }
})()

export default {
  rootId: FILE_ROOT_KEY,
  ready () {
    return readyDeferred.promise
  },

  //异步返回数据
  async readFile (id) {
    var deferred = Promise.defer()
    var tx = db.transaction(FILE_STORE_NAME, 'readonly')
    var req = tx.objectStore(FILE_STORE_NAME).get(id)
    req.onsuccess = function (e) {
      if (this.result) {
        deferred.resolve(this.result)
      } else {
        deferred.reject(`file id ${id} not exist in ${FILE_STORE_NAME}`)
      }
    }
    req.onerror = function () {
      deferred.reject(this.error.message)
    }
    return deferred.promise
  },
  //异步返回数据
  async storeFile (record) {
    var deferred = Promise.defer()
    var tx = db.transaction(FILE_STORE_NAME, 'readwrite')
    var req = tx.objectStore(FILE_STORE_NAME).put(record)
    req.onsuccess = function (e) {
      record.id = this.result
      deferred.resolve(record)
    }
    req.onerror = function (e) {
      deferred.reject(this.error.message)
    }
    return deferred.promise
  },
  //异步返回boolean
  async removeFile (id) {
    var deferred = Promise.defer()
    var tx = db.transaction(FILE_STORE_NAME, 'readwrite')
    var req = tx.objectStore(FILE_STORE_NAME).delete(id)
    req.onsuccess = function () {
      deferred.resolve(true)
    }
    req.onerror = function () {
      deferred.reject(this.error.message)
    }
    return deferred.promise
  },
  //异步返回boolean
  async removeFolder (id) {
    var deferred = Promise.defer()
    var tx = db.transaction(FILE_STORE_NAME, 'readwrite')
    var store = tx.objectStore(FILE_STORE_NAME)

    function remove (id) {
      store.get(id).onsuccess = function (e) {
        var folder = e.target.result
        var req = store.delete(id)
        req.onsuccess = function () {
          deferred.resolve(true)
          folder.content.forEach(f => {
            if (f.isFolder) {
              remove(f.id)
            } else {
              store.delete(f.id)
            }
          })
        }
        req.onerror = function (e) {
          deferred.reject(this.error.message)
        }
      }
    }
    remove(id)
    return deferred.promise
  }

}
