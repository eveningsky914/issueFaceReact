const app = require('../index');

module.exports = function handler(req, res) {
  return app(req, res);
};
