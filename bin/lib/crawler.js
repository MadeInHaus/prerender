var Q = require('q');

var Crawler = require("crawler").Crawler;


function crawl(targetDomain) {
  var deferred = Q.defer();

  var done = {};

  var crawler = new Crawler({
    "maxConnections":10,

    // This will be called for each crawled page
    "callback":function(error,result,$) {
        console.log('queue: ', this.queue);
        // $ is a jQuery instance scoped to the server-side DOM of the page
        $("a").each(function(index,a) {
            var thisURL = $(a).prop('href');
            if (thisURL.indexOf("?_escaped_fragment_=")<0) {
                var connector = thisURL.indexOf('?')>0 ? "&" : "?";
                thisURL += connector + "_escaped_fragment_=";
            }
            if (thisURL.indexOf(domain) == 0) {
              if (done[thisURL] == undefined) {
                c.queue(thisURL);
                console.log('queuing: ', thisURL);
                done[thisURL] = true;
              }
            } else {
              console.log('skipping: ', thisURL);
            }
        });
      },

      skipDuplicates: true
  });

  crawler.queue(targetDomain+"?_escaped_fragment_=");

  return deferred.promise;
}

module.exports = {
  crawl: crawl
}
