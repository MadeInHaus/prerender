
var Q = require('q');
var currentCachedURLs = require('./currentCachedURLs');


var info = {};

function updatePrefix(info) {
  var prefix = (info.prerender) ? info.prerender : '';
  if (process.env.S3_PREFIX_KEY) {
    prefix = process.env.S3_PREFIX_KEY;
  }

  var prefixNum = prefix.match(/\d+$/);
  if (prefixNum) {
     prefixNum = parseInt(prefixNum[0])+1;
   } else {
      prefixNum = 0;
    };

  var newPrefix = 'prerender_' + prefixNum;
  info.prefix = prefix;
  info.nextPrefix = newPrefix;
}

function update() {
  updatePrefix(info);
  info.prerenderURL = process.env.HEROKU_APP_NAME + '.herokuapp.com';

  var deferred = Q.defer();
  currentCachedURLs.collectCacheMap(info.prefix)
  .done(
    function (cacheMap) {
      info.cacheMap = cacheMap;
      deferred.resolve(info);
    }
  );

  if (process.env.ALLOWED_DOMAINS) {
    info.whiteList = process.env.ALLOWED_DOMAINS.split(',');
  }

  return deferred.promise;
}


module.exports = {
    info: info,
    update: update
}
