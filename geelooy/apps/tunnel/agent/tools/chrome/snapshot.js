// B"H

const { cdpCall } = require("./cdp.js");
const { readChromeLogs } = require("./logs.js");

/**
 * B"H
 * Reads a compact living snapshot from the current page.
 *
 * The page is a small world; the Awtsmoos recreates its title, URL, readyState,
 * focused element, visible text, and errors at every moment. This helper gathers
 * that breath into one vessel so an agent can see without guessing.
 *
 * @param {object} [options] Snapshot options.
 * @param {number} [options.maxText=4000] Maximum body text characters.
 * @param {number} [options.maxHtml=0] Optional HTML characters.
 * @param {number} [options.maxLogs=200] Maximum logs.
 * @param {boolean} [options.clearLogs=false] Clear logs after reading.
 * @returns {Promise<object>} Snapshot object.
 */
async function pageSnapshot(options = {}) {
  const maxText = Math.max(0, Math.min(Number(options.maxText || 4000), 30000));
  const maxHtml = Math.max(0, Math.min(Number(options.maxHtml || 0), 100000));

  const expression = `
    (() => {
      const active = document.activeElement;
      const body = document.body;
      return {
        url: location.href,
        title: document.title,
        readyState: document.readyState,
        activeElement: active ? {
          tagName: active.tagName,
          id: active.id || "",
          className: String(active.className || ""),
          name: active.getAttribute("name") || "",
          ariaLabel: active.getAttribute("aria-label") || ""
        } : null,
        bodyText: body ? body.innerText.slice(0, ${maxText}) : "",
        html: ${maxHtml} ? document.documentElement.outerHTML.slice(0, ${maxHtml}) : ""
      };
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return {
    page: result.result?.value || null,
    logs: readChromeLogs({
      maxLogs: options.maxLogs || 200,
      clear: !!options.clearLogs
    })
  };
}

module.exports = { pageSnapshot };
