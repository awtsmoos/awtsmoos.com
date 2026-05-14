
// B"H
const http = require("http");
const { TinyWebSocket } = require("../../lib/ws.js");

let cdp = null;
let nextId = 1;
const callbacks = new Map();

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function version(port) {
  return await getJson("http://127.0.0.1:" + port + "/json/version");
}

async function pages(port) {
  return await getJson("http://127.0.0.1:" + port + "/json");
}

async function connectCdp(port) {
  const info = await version(port);
  const wsUrl = info.webSocketDebuggerUrl;

  cdp = new TinyWebSocket(wsUrl);

  cdp.on("message", msg => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);

      if (data.error) cb.reject(new Error(JSON.stringify(data.error)));
      else cb.resolve(data.result);
    }
  });

  await new Promise((resolve, reject) => {
    cdp.once("open", resolve);
    cdp.once("error", reject);
    cdp.connect();
  });

  return true;
}

async function ensureCdp(port) {
  if (!cdp || !cdp.opened) {
    await connectCdp(port);
  }

  return cdp;
}

function cdpCall(method, params = {}) {
  if (!cdp || !cdp.opened) {
    throw new Error("Chrome DevTools is not connected. Launch Chrome first.");
  }

  const id = nextId++;
  cdp.sendJson({ id, method, params });

  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });

    setTimeout(() => {
      if (callbacks.has(id)) {
        callbacks.delete(id);
        reject(new Error("CDP timeout for " + method));
      }
    }, 20000);
  });
}

module.exports = {
  version,
  pages,
  connectCdp,
  ensureCdp,
  cdpCall
};
