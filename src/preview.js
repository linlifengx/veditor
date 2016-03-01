self.addEventListener('install', function(event) {
  //self.skipWaiting();
  //console.log('Installed', event);
})

self.addEventListener('activate', function(event) {
  //console.log('Activated', event);
})

var DB_NAME = 'seditor'
var DB_VERSION = 1
var FILE_STORE_NAME = 'file_store'
var FILE_ROOT_KEY = 'root'
var db = null
var dbReady = null

//console.log('Started', self)

function init () {
  var deferred = Promise.defer()
  var req = indexedDB.open(DB_NAME, DB_VERSION)
  req.onsuccess = function (e) {
    db = this.result
    deferred.resolve()
  }
  req.onerror = function (e) {
    console.log('initDB error: ' + e.target.error.message)
    deferred.reject()
  }
  dbReady = deferred.promise
}
init()

function getFile (id) {
  var deferred = Promise.defer()
  var tx = db.transaction(FILE_STORE_NAME, 'readonly')
  var req = tx.objectStore(FILE_STORE_NAME).get(id)
  req.onsuccess = function (e) {
    if (this.result) {
      deferred.resolve(this.result)
    } else {
      deferred.resolve(null)
    }
  }
  req.onerror = function () {
    deferred.reject(this.error.message)
  }
  return deferred.promise
}

function getPath (paths) {
  var deferred = Promise.defer()
  var i = 0
  var folderId = FILE_ROOT_KEY
  function loop () {
    getFile(folderId).then(function (record) {
      var f = record.content.find(function (f) {
        return f.name == paths[i]
      })
      if (f && i < paths.length-1 && f.isFolder) {
        folderId = f.id
        i++
        loop()
      } else if (f && i == paths.length-1 && !f.isFolder) {
        getFile(f.id).then(function (f) {
          deferred.resolve(f)
        })
      } else {
        deferred.resolve(null)
      }
    })
  }

  loop()
  return deferred.promise
}

self.addEventListener('fetch', function(event) {
  var url = event.request.url
  var paths = url.split('/')
  paths = paths.slice(paths.indexOf('preview')+1)
  if (paths.length == 0) {
    event.respondWith(Response.error())
  } else {
    event.respondWith(new Promise(function (resolve, reject) {
      dbReady.then(function () {
        getPath(paths).then(function (f) {
          if (f) {
            var contentType = 'text/plain'
            if (url.endsWith('.html') || url.endsWith('.htm')) {
              contentType = 'text/html'
            } else if (url.endsWith('.js')) {
              contentType = 'application/javascript'
            } else if (url.endsWith('.css')) {
              contentType = 'text/css'
            }
            var response = new Response(f.content, {
              headers: { 'Content-Type': contentType }
            })
            resolve(response)
          } else {
            resolve(Response.error())
          }
        })
      })
    }))
  }
})
