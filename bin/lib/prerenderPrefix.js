var Q = require('q');
var https = require('https');


module.exports = {
  changePrefix: function(newPrefix) {
  	var deferred = Q.defer();
  	var prefixJSON = JSON.stringify({S3_PREFIX_KEY: newPrefix});

  	var heroku = https.request({
  		hostname: 'api.heroku.com',
  		path: '/apps/' + process.env.HEROKU_APP_NAME + '/config-vars',
  		method: 'PATCH',
  		headers: {
  			Accept: "application/vnd.heroku+json; version=3",
  			'Content-Length': '' + prefixJSON.length
  		},
  		auth: process.env.HEROKU_EMAIL + ':' + process.env.HEROKU_API_TOKEN
  	}, deferred.resolve);

  	heroku.on('error', function(e) {
  	  console.log('Got error: ' + e.message);
  	});

  	heroku.write(prefixJSON);
  	heroku.end();

  	return deferred.promise;
  },

  handleUpdatePrefix: function(res) {
  	var deferred = Q.defer();
  	var responseString = '';

  	res.on('data', function(data) {
  		responseString += data;
  	});

  	console.log('updating prefix: ', res.statusCode);
  	console.log('response: ' + responseString);
  	deferred.resolve(res.statusCode);
  	return deferred.promise;
  },

  doChangePrefix: function(newPrefix) {
    var delayTime = 7000; // give heroku some time to restart before continuing
    return this.changePrefix(newPrefix)
            .then(this.handleUpdatePrefix)
            .delay(delayTime);
  }
}
