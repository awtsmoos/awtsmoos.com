
// B"H
const http = require("http");
const { TinyWebSocket } = require("../../lib/ws.js");

let pageWs = null;
let nextId = 1;
const callbacks = new Map();

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");

        try {
          resolve(JSON.parse(text));
        } catch (e) {
          reject(new Error("Bad JSON from " + url + ": " + text.slice(0, 200)));
        }
      });
    }).on("error", reject);
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    }).on("error", reject);
  });
}

async function version(port) {
  return await getJson("http://127.0.0.1:" + port + "/json/version");
}

async function pages(port) {
  return await getJson("http://127.0.0.1:" + port + "/json");
}

async function newPage(port, url = "about:blank") {
  const encoded = encodeURIComponent(url);
  return await getJson("http://127.0.0.1:" + port + "/json/new?" + encoded);
}

function wireSocket(ws) {
  ws.on("message", msg => {
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
}

async function connectPageWs(webSocketDebuggerUrl) {
  pageWs = new TinyWebSocket(webSocketDebuggerUrl);
  wireSocket(pageWs);

  await new Promise((resolve, reject) => {
    pageWs.once("open", resolve);
    pageWs.once("error", reject);
    pageWs.connect();
  });

  await cdpCall("Runtime.enable");
  await cdpCall("Page.enable");
  await cdpCall("DOM.enable");

  return pageWs;
}

async function ensurePage(port) {
  if (pageWs && pageWs.opened) {
    return pageWs;
  }

  let list = [];

  try {
    list = await pages(port);
  } catch (e) {
    throw new Error("Chrome DevTools not reachable on port " + port + ": " + e.message);
  }

  let page = list.find(p => p.type === "page" && p.webSocketDebuggerUrl);

  if (!page) {
    page = await newPage(port, "about:blank");
  }

  if (!page.webSocketDebuggerUrl) {
    throw new Error("No page websocket found.");
  }

  return await connectPageWs(page.webSocketDebuggerUrl);
}

async function cdpCall(method, params = {}) {
  if (!pageWs || !pageWs.opened) {
    throw new Error("Page DevTools socket is not connected.");
  }

  const id = nextId++;
  pageWs.sendJson({ id, method, params });

  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });

    setTimeout(() => {
      if (callbacks.has(id)) {
        callbacks.delete(id);
        reject(new Error("CDP timeout for " + method));
      }
    }, 30000);
  });
}

async function navigateAndWait(url, timeoutMs = 15000) {
  await cdpCall("Page.navigate", { url });

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const state = await cdpCall("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true
    });

    if (state.result?.value === "complete" || state.result?.value === "interactive") {
      return {
        ok: true,
        readyState: state.result.value
      };
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return {
    ok: false,
    readyState: "timeout"
  };
}

module.exports = {
  version,
  pages,
  newPage,
  ensurePage,
  cdpCall,
  navigateAndWait,
  getText
};
