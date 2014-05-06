var s3 = new (require('aws-sdk')).S3({params:{Bucket: process.env.S3_BUCKET_NAME}});

var http = require('http');
var Q = require('q');
var url = require('url');

module.exports = {
  getObjects: function(prefix) {
    console.log('prefix: ', prefix);
  	var deferred = Q.defer();
  	s3.listObjects({ Prefix: prefix}, deferred.makeNodeResolver());
  	return deferred.promise;
  },

  constructCacheMap: function(prefix) {
    return function(data) {
      var deferred = Q.defer();
      var theMap = {};
    	data.Contents.forEach(function(item) {
        var key = item.Key;
        var theURL = key.replace(prefix, '');
        if (theURL[0] === '/') theURL = theURL.substr(1);
        var parts = url.parse(theURL);

        if (!theMap[parts.host]) theMap[parts.host] = [parts.href];
        else theMap[parts.host].push(parts.href)

    	});
      deferred.resolve(theMap);
    	return deferred.promise;
    };
  },

  getCacheMapName: function(prefix) {
    return "CacheMap.json";
  },

  getStoredCacheMap: function(prefix) {
    var deferred = Q.defer();
    var content = "";

    console.log("getStoredCacheMap");

    s3.getObject({Key: this.getCacheMapName(prefix)}, deferred.makeNodeResolver())
    // .on('httpData', function(chunk) { content += chunk; })
    // .on('httpDone', function() { deferred.resolve(content); })
    .send();

    return deferred.promise;
  },

  setStoredCacheMap: function(prefix, cacheMap) {
    var deferred = Q.defer();

    s3.putObject(
      {Key: this.getCacheMapName(prefix), Body: JSON.stringify(cacheMap)},
      deferred.makeNodeResolver());

    return deferred.promise;
  },

  collectCacheMap: function(prefix) {
    return this.getObjects(prefix).then(this.constructCacheMap(prefix));
  },

  getCacheMap: function(prefix) {
    var obj = this; // Note for the future:  had trouble referring to other functions in this object without this var, is this the right way to solve this problem?

    return this.getStoredCacheMap(prefix)
    .then(function(data) {
      data = data.Body.toString();
      return Q(JSON.parse(data));
    })
    .fail(function (error) {
      console.log("Got Error: ", error);
      return Q(obj.collectCacheMap(prefix).then(
          function(cacheMap) {
            return obj.setStoredCacheMap(prefix, cacheMap)
              .then(function() { return Q(cacheMap); });
            }
          )
        );
    });
  }

}
