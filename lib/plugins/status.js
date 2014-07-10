//  return status of prerender... for now just a 200 ok

module.exports = {
    init: function() {
    },

    beforePhantomRequest: function(req, res, next) {
      if (req.prerender.url === 'status/') {
        res.send(200, 'ok');
        return;
      } else {
        next();
      }
    }
};
