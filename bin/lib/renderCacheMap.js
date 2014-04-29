
var http = require('http');
var Q = require('q');

var retry = require('./utils').retry;

var prerenderURL = process.env.HEROKU_APP_NAME + '.herokuapp.com';


function renderEndpoint(item) {
  var deferred = Q.defer();
  console.log('got item: ', item);

  http.request({
    hostname: prerenderURL,
    path: '/' + item,
    method: 'GET'
  }, deferred.resolve).end();

  return deferred.promise;
}


function renderEndpointResult(res) {
  var deferred = Q.defer();
  console.log('statusCode: ', res.statusCode);
  if (res.statusCode != 200) {
    deferred.reject("Did not get a 200");
  }
  deferred.resolve(res.statusCode == 200);
  return deferred.promise;
}


function renderEndpoints(data) {
  console.log('handleObjects: ', data);
  var queue = [];

  for (var item in data) {
    console.log('item: ', item);
    if (data.hasOwnProperty(item)) {
      var endpoints = data[item];
      endpoints.forEach(
        function(endpoint) {
          console.log('item: ', endpoint);
          queue.push(Q.fcall(renderEndpoint, endpoint).then(renderEndpointResult));
        }
      );
    }
  }
  return Q.all(queue);
}


module.exports = {
  renderCacheMap: function(cacheMap) {
    console.log('cacheMap: ', cacheMap);
	  promise = function() { return renderEndpoints(cacheMap) };
	  return retry(promise, 5);
  }

}
