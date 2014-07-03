//  return status of prerender... for now just a 200 ok

module.exports = {
    init: function() {
    },

    beforePhantomRequest: function(req, res, next) {
      console.log('status plugin: ', req.prerender.url);
      if (req.prerender.url === 'status/') {
        res.send(200, 'ok');
        return;
      } else {
        next();
      }
    },

    afterPhantomRequest: function(req, res, next) {
    }
};
