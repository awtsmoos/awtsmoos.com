//B"H
/**
 * Chapter 30: The Bridge Spoke To The Browser.
 *
 * Node cannot emulate sessionStorage/localStorage. This module sets up a WebSocket
 * bridge between Node and the real browser. All browser-only API calls are sent as
 * commands to the browser for execution.
 */

const WebSocket = require('ws');
const { log } = require('./logger.cjs');

let wsServer;
const clients = new Set();

/**
 * Start a WebSocket server on Node to communicate with connected browser clients.
 * @param {number} port Port to listen on
 */
function startBrowserBridge(port = 39505) {
  wsServer = new WebSocket.Server({ port });
  wsServer.on('connection', ws => {
    clients.add(ws);
    ws.on('message', async message => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'storage-get') {
          // Node cannot respond; ask browser
          ws.send(JSON.stringify({ id: data.id, result: null, error: 'pending in browser' }));
        }
      } catch (err) {
        log({ verbose: true }, 'browser-bridge:error', { error: err.message });
      }
    });
    ws.on('close', () => clients.delete(ws));
  });
  log({ verbose: true }, 'browser-bridge', { port, clients: clients.size });
  return wsServer;
}

/**
 * Broadcast a command to all connected browser clients.
 * @param {object} cmd Command object
 */
function broadcastCommand(cmd) {
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(cmd));
    }
  }
}

module.exports = { startBrowserBridge, broadcastCommand };