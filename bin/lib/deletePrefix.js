var s3 = new (require('aws-sdk')).S3({params:{Bucket: process.env.S3_BUCKET_NAME}});

var http = require('http');
var Q = require('q');
var url = require('url');
var currentCachedURLs = require('./currentCachedURLs');

function deleteEndpoint(endpoint) {
  var deferred = Q.defer();
  console.log('hah endpoint:', endpoint);
  deferred.resolve('true');
  return deferred.promise;
}

function cacheDeleter(prefix) {
  return function(cacheMap) {
    console.log('cacheMap: ', cacheMap);
    var queue = [];

    for (var item in cacheMap) {
      console.log('item: ', item);
      if (cacheMap.hasOwnProperty(item)) {
        var endpoints = cacheMap[item];
        endpoints.forEach(
          function(endpoint) {
            endpoint = prefix + '/' + endpoint;
            console.log('item: ', endpoint);
            queue.push(Q.fcall(deleteEndpoint, endpoint).then(undefined, undefined));
          }
        );
      }
    }
    return Q.all(queue);

    };
}

module.exports = {

  deletePrefix: function(prefix) {
    return currentCachedURLs.collectCacheMap(prefix)
      .then(cacheDeleter(prefix));
  }

}
