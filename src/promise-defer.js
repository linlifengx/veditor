var Promise = window.Promise

if (!Promise.defer) {
  Promise.defer = function () {
    var deferred = {}
    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = function (...args) {resolve(...args)}
      deferred.reject = function (...args) {reject(...args)}
    })
    return deferred
  }
}
