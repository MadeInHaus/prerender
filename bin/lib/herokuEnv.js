var https = require('https');
var Q = require('q');


module.exports = {
  setEnv: function (name, value) {
    var deferred = Q.defer();

    var data = {};
    data[name] = value;
    data = JSON.stringify(data);

    var req = https.request({
      hostname: 'api.heroku.com',
      path: '/apps/' + process.env.HEROKU_APP_NAME + '/config-vars',
      method: 'PATCH',
      headers: {
        Accept: "application/vnd.heroku+json; version=3",
        'Content-Length': data.length
      },
      auth: process.env.HEROKU_EMAIL + ':' + process.env.HEROKU_API_TOKEN
    }, function (res) {
      // assumes variable deferred in the context...

      var content = '';
      console.log('Got response: ', res.statusCode);
      if (!res.statusCode == 200) deferred.reject('got result: ' + res.statusCode);
      res.on('data', function (chunk) {
        content += chunk;
      });
      res.on('end', function() {
        var response = JSON.parse(content);
        deferred.resolve(response);
      });
    })
    .on('error', function(e) {
      console.log('Got error: ' + e.message);
      deferred.reject('got error: ' + e.message);
    });

    req.write(data);
    req.end();

    return deferred.promise;
  },

  getEnv: function (name) {
    var deferred = Q.defer();

    https.request({
      hostname: 'api.heroku.com',
      path: '/apps/' + process.env.HEROKU_APP_NAME + '/config-vars',
      method: 'GET',
      headers: {
        Accept: "application/vnd.heroku+json; version=3"
      },
      auth: process.env.HEROKU_EMAIL + ':' + process.env.HEROKU_API_TOKEN
    }, function (res) {
      // assumes variable deferred in the context...

      var content = '';
      console.log('Got response: ', res.statusCode);
      if (!res.statusCode == 200) deferred.reject('got result: ' + res.statusCode);
      res.on('data', function (chunk) {
        content += chunk;
      });
      res.on('end', function() {
        var response = JSON.parse(content);
        deferred.resolve(response);
      });
    })
    .on('error', function(e) {
      console.log('Got error: ' + e.message);
      deferred.reject('got error: ' + e.message);
    }).end();

    return deferred.promise;
  }

};
