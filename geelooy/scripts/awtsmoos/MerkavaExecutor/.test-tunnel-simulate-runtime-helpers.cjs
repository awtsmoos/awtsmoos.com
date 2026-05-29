// B"H
const http = require('http');
const { buildActions } = require('../../../apps/tunnel/agent/tools/fs/actions.js');

/**
 * Chapter 1: The helper lamp in the Merkava cave.
 * The Awtsmoos speaks through a small Node server, not Chromium, and each test
 * receives a clean origin where URL collection, module discovery, and virtual
 * browser actions can leave real footprints.
 */
function listenWithRoutes(routes) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const route = routes[url.pathname] || routes['*'];
    if (!route) {
      res.statusCode = 404;
      res.end('missing ' + url.pathname);
      return;
    }
    const out = typeof route === 'function' ? route(req, url) : route;
    res.setHeader('content-type', out.type || 'text/plain');
    res.end(out.body || '');
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port, origin: `http://127.0.0.1:${port}` });
    });
  });
}

/**
 * B"H — Close the little world after its evidence has been harvested.
 */
function closeServer(server) {
  return new Promise(resolve => server.close(resolve));
}

/**
 * B"H — Invoke the real tunnel simulateRuntime action path with Merkava.
 */
async function simulate(payload) {
  const config = {
    root: process.cwd(),
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true }
  };
  return buildActions(config, { action: 'simulateRuntime', ...payload }, null).simulateRuntime();
}

/**
 * B"H — Base64 JSON scroll for actions64/browserActions64/pageActions64.
 */
function b64json(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

/**
 * B"H — Print evidence and fail only from real observed output.
 */
function requireTruth(condition, label, evidence) {
  if (condition) return;
  console.error(JSON.stringify({ failure: label, evidence }, null, 2));
  process.exit(1);
}

module.exports = { listenWithRoutes, closeServer, simulate, b64json, requireTruth };
