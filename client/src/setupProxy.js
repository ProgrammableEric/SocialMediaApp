const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://us-central1-smclone-3d5f9.cloudfunctions.net",
      changeOrigin: true
    })
  );
};
