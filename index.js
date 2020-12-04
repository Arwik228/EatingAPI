'use strict';

const fs = require('fs');
const path = require('path');
const serveStatic = require('serve-static');
const http = require('http');
const app = require('connect')();
const swaggerTools = require('swagger-tools');
const WebSocketServer = require('websocket').server;
const jsyaml = require('js-yaml');
const socket = require('./service/chatService');
const serverPort = 8080;

var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development'
};

var spec = fs.readFileSync(path.join(__dirname, 'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  app.use(middleware.swaggerMetadata());

  app.use(middleware.swaggerValidator());

  app.use(middleware.swaggerRouter(options));

  app.use(serveStatic("./source"));

  app.use(middleware.swaggerUi());

  let server = http.createServer(app);

  server.listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });

  socket.init(WebSocketServer, server);
});
