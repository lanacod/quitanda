const app = require('..');

module.exports = (req, res) => {
  if (req.url === '/api') {
    req.url = '/';
  } else if (req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  return app(req, res);
};
