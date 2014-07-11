var Q = require('q');

var Crawler = require("crawler").Crawler;


function makeCrawler() {
  var domain;    // only crawl the given domain
  var done = {}; // used to ensure that a url is only crawled once
  var count = 0; // counts the number of urls that have been queued

  var crawler = new Crawler({
    "maxConnections": 5,

    // This will be called for each crawled page
    "callback":function(error,result,$) {
        count --;
        if (error) {
          console.log('Got error: ', error);
          return;
        }
        console.log('queue count: ', count);
        // $ is a jQuery instance scoped to the server-side DOM of the page
        $("a").each(function(index,a) {
            var thisURL = $(a).prop('href');
            if (thisURL.indexOf("?_escaped_fragment_=")<0) {
                var connector = thisURL.indexOf('?')>0 ? "&" : "?";
                thisURL += connector + "_escaped_fragment_=";
            }
            thisURL = thisURL.replace(/#+$/, '');  //ommit final # if present
            if (thisURL.indexOf(domain) == 0) {
              if (done[thisURL] == undefined) {
                crawler.queue(thisURL);
                console.log('queuing: ', thisURL);
                count ++;
                done[thisURL] = true;
              }
            } else {
              // console.log('skipping: ', thisURL);
            }
        });

        if (count === 0) {
          // queue is empty resolve the promise
          crawler.deferred.resolve(done);
        }
      },

      skipDuplicates: true
  });

  function crawl(targetDomain) {
    crawler.deferred = Q.defer();
    crawler.cache = {};
    done = {};
    domain = targetDomain;
    crawler.queue(targetDomain+"?_escaped_fragment_=");
    count ++;
    return crawler.deferred.promise;
  }


  crawl.crawler = crawler;

  return crawl;
}

function crawlDomains(domains) {
  var promise = Q();
  var crawler = makeCrawler()

  domains.forEach(function (domain) {
    promise = promise.then(function() {
      if (domain.indexOf('http') != 0) {
          domain = 'http://' + domain
      }

      console.log('crawling: ', domain);

      return crawler(domain)
      });

  });

  return promise;
}


module.exports = {
  crawl: makeCrawler(),
  crawlDomains: crawlDomains,
}
