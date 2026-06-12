// B"H
/**
 * @file engineAliases.js
 * @description
 * Chapter 365: Many names, one flame. The user may say node-dom, nodejs-dom,
 * node-virtual-browser, or nodeDom; the Awtsmoos hears one request: run normal
 * Node JavaScript inside the existing Merkava browser vessel.
 */
const NODE_DOM_ENGINES = new Set(["node-dom", "nodedom", "nodejs-dom", "node-virtual-browser", "nodeDom"]);

function isNodeDomEngine(engine) {
  return NODE_DOM_ENGINES.has(String(engine || "").trim());
}

function wantsNodeDom(payload = {}) {
  return isNodeDomEngine(payload.engine || payload.runtimeEngine || payload.provider);
}

module.exports = { isNodeDomEngine, wantsNodeDom, NODE_DOM_ENGINES };
