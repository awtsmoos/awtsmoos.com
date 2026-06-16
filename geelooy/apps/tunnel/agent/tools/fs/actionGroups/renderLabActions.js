// B"H
const path = require("path");
const { pathToFileURL } = require("url");

let servicePromise = null;

function serviceUrl() {
  return pathToFileURL(path.resolve(__dirname, "../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js")).href;
}

async function loadService() {
  if (!servicePromise) servicePromise = import(serviceUrl());
  return await servicePromise;
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function optionsFromPayload(payload = {}) {
  const files = parseJson(payload.files, null) || (payload.files64 ? parseJson(Buffer.from(String(payload.files64), "base64").toString("utf8"), null) : null) || (payload.html ? { [payload.entry || "index.html"]: String(payload.html) } : null);
  return {
    title: payload.title || "Awtsmoos Render Lab",
    mode: payload.mode,
    modes: parseJson(payload.modes, null) || payload.modes,
    entry: payload.entry || "index.html",
    html: payload.html || payload.content || "",
    files: files || undefined,
    url: payload.url || "http://localhost:8080/",
    width: Number(payload.width || payload.viewportWidth || 960),
    height: Number(payload.height || payload.viewportHeight || 640),
    interactions: parseJson(payload.interactions || payload.actions || payload.browserActions, []),
    returnValues: parseJson(payload.returnValues || payload.values, [])
  };
}

/**
 * B"H
 * Chapter: Native tunnel gained a render laboratory without needing Chrome.
 */
function buildRenderLabActions(ctx) {
  const { payload } = ctx;
  const run = async action => {
    const service = await loadService();
    const result = await service.runRenderLab(optionsFromPayload(payload));
    return { ...result, action };
  };
  return {
    async domDomRenderLab() { return await run("domDomRenderLab"); },
    async merkavaRenderLab() { return await run("merkavaRenderLab"); },
    async appModeMatrix() { return await run("appModeMatrix"); },
    async renderModeMatrix() { return await run("renderModeMatrix"); },
    async virtualDomScreenshot() { return await run("virtualDomScreenshot"); },
    async virtualDomSnapshot() { return await run("virtualDomSnapshot"); }
  };
}

module.exports = { buildRenderLabActions, optionsFromPayload };
