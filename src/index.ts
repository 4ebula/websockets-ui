import { httpServer } from './http_server';
import { WSServer } from './ws';

const HTTP_PORT = 8181;
const WS_PORT = 3000;

let ws: WSServer;

httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
  ws = new WSServer(WS_PORT);
  ws.run();
});

process.on('SIGINT', () => {
  httpServer.close();
  ws.close();
  // console.log();
});

process.on('exit', () => {
  httpServer.close();
  ws.close();
});
