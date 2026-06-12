// B"H

const MAX_LOGS = 1200;
const entries = [];

/**
 * B"H
 * Adds one Chrome omen to the in-memory river.
 *
 * The Awtsmoos renews every spark every instant; this store catches the browser
 * sparks before they vanish into the dark between frames. Console messages,
 * thrown exceptions, network failures, and Chrome process stderr all enter here
 * with one shape so agents can inspect page life without opening PowerShell.
 *
 * @param {string} source Where the sign came from, such as runtime, page, log, network, process.
 * @param {string} level Severity or flavor.
 * @param {string} message Human-readable message.
 * @param {object} [details] Structured details from CDP or process streams.
 * @returns {object} The stored entry.
 */
function addChromeLog(source, level, message, details = {}) {
  const entry = {
    ts: Date.now(),
    iso: new Date().toISOString(),
    source: String(source || "chrome"),
    level: String(level || "info"),
    message: String(message || ""),
    details: details && typeof details === "object" ? details : {}
  };

  entries.push(entry);

  while (entries.length > MAX_LOGS) entries.shift();

  return entry;
}

/**
 * B"H
 * Converts a CDP remote object into a compact, safe value.
 *
 * @param {object} arg CDP remote object.
 * @returns {string} Compact preview.
 */
function remoteValue(arg) {
  if (!arg) return "";
  if (arg.value !== undefined) return typeof arg.value === "string" ? arg.value : JSON.stringify(arg.value);
  if (arg.description) return String(arg.description);
  if (arg.unserializableValue) return String(arg.unserializableValue);
  return arg.type || "";
}

/**
 * B"H
 * Records one raw Chrome DevTools Protocol event if it carries useful pain,
 * warning, speech, broken network breath, or script thunder.
 *
 * @param {object} event Raw CDP event.
 * @returns {object|null} Stored entry, or null when the event is intentionally quiet.
 */
function captureCdpEvent(event = {}) {
  const method = event.method;
  const params = event.params || {};

  if (method === "Runtime.consoleAPICalled") {
    const message = (params.args || []).map(remoteValue).filter(Boolean).join(" ");
    return addChromeLog("runtime.console", params.type || "log", message, {
      type: params.type,
      stackTrace: params.stackTrace || null,
      executionContextId: params.executionContextId || null
    });
  }

  if (method === "Runtime.exceptionThrown") {
    const ex = params.exceptionDetails || {};
    return addChromeLog("runtime.exception", "error", ex.text || ex.exception?.description || "JavaScript exception", ex);
  }

  if (method === "Log.entryAdded") {
    const entry = params.entry || {};
    return addChromeLog("log.entry", entry.level || "info", entry.text || "", entry);
  }

  if (method === "Network.loadingFailed") {
    return addChromeLog("network.loadingFailed", "error", params.errorText || "Network loading failed", params);
  }

  if (method === "Page.javascriptDialogOpening") {
    return addChromeLog("page.dialog", "warning", params.message || "JavaScript dialog opened", params);
  }

  if (method === "Page.loadEventFired") {
    return addChromeLog("page.load", "info", "Page load event fired", params);
  }

  return null;
}

/**
 * B"H
 * Returns recent browser omens.
 *
 * @param {object} [options] Read options.
 * @param {number} [options.maxLogs=200] Maximum logs to return.
 * @param {boolean} [options.clear=false] Whether to clear after reading.
 * @returns {{logs: object[], count: number, totalBuffered: number, cleared: boolean}}
 */
function readChromeLogs(options = {}) {
  const maxLogs = Math.max(1, Math.min(Number(options.maxLogs || 200), 1000));
  const logs = entries.slice(-maxLogs);

  if (options.clear) entries.length = 0;

  return {
    logs,
    count: logs.length,
    totalBuffered: entries.length,
    cleared: !!options.clear
  };
}

module.exports = {
  addChromeLog,
  captureCdpEvent,
  readChromeLogs
};
