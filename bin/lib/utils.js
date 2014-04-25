
var Q = require('q');

function retry(promise, maxRetries, retryNum) {
  var delayDuration = 5000;

  // optionally can be called with only the promise and maxRetries defined
  if (typeof retryNum === "undefined") {
    retryNum = 0;
  }

  if (retryNum>maxRetries) {
    console.log("reached max retries");
    return Q(false);
  }

  if (retryNum>0) console.log('retry: ', retryNum);

  return Q().delay(retryNum>0?delayDuration:0)
    .then(function() {return promise();})
    .then(undefined,
      function(err) {
        console.log('got an error, retrying: ', err);
        return retry(promise, maxRetries, retryNum+1);
      });
}


module.exports = {
  retry: retry
}
