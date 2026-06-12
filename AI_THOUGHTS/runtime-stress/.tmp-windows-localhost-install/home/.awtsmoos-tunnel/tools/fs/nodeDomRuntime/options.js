// B"H
/**
 * @file options.js
 * @description Chapter 366: URL mode and file mode become one scroll. The
 * Awtsmoos server root can remain alive while node-dom executes the hydrated
 * virtual browser.
 */
function normalizeNodeDomOptions(options = {}) {
  const origin = options.origin || originOf(options.url) || "http://127.0.0.1:8080";
  return {
    runtime: options.runtime || "browser",
    engine: "node-dom",
    entry: options.entry || "index.html",
    files: options.files || options.virtualEnv?.files || {},
    virtualEnv: options.virtualEnv || null,
    html: options.html || null,
    browserActions: options.browserActions || options.pageActions || options.interactions || [],
    pageActions: options.pageActions || options.browserActions || [],
    returnValues: options.returnValues || options.values || [],
    waitMs: Number(options.waitMs || 0),
    timeoutMs: Number(options.timeoutMs || 30000),
    url: options.url || origin + "/",
    origin,
    allowUrlFetch: options.allowUrlFetch !== false,
    format: options.format || options.returnFormat || options.outputFormat || "json"
  };
}
function originOf(url) { try { return url ? new URL(String(url)).origin : null; } catch (_) { return null; } }
module.exports = { normalizeNodeDomOptions, originOf };
