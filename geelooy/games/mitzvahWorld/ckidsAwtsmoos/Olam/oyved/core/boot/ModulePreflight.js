/**
 * B"H
 * @module ModulePreflight
 * @description
 * CHAPTER 5: THE GUARD AT THE GATE OF THE MODULE.
 *
 * Before a dynamic import is allowed to walk into the palace,
 * this guardian knocks on the URL and asks:
 *
 * "Are you JavaScript, or are you a JSON 404 wearing a mask?"
 *
 * This directly targets the exact browser error:
 *
 * Expected a JavaScript-or-Wasm module script but the server responded
 * with a MIME type of application/json.
 *
 * That error usually means the custom server returned a JSON 404 body
 * for a missing .js route. The browser then refuses to execute it,
 * because module scripts require strict MIME correctness.
 *
 * The Awtsmoos creates the world every instant with precise speech.
 * So too, this code demands precise content-type before creation begins.
 */

/**
 * @typedef {Object} PreflightResult
 * @property {boolean} ok
 * Whether the URL appears importable.
 *
 * @property {string} url
 * Fully resolved URL.
 *
 * @property {number} status
 * HTTP status code, or 0 if fetch itself failed.
 *
 * @property {string} contentType
 * Response content-type header.
 *
 * @property {string} bodyPreview
 * First slice of response text for diagnostics.
 */

/**
 * Acceptable JavaScript module MIME fragments.
 *
 * @type {string[]}
 */
const JAVASCRIPT_MIME_SIGNS = Object.freeze([
  "text/javascript",
  "application/javascript",
  "application/ecmascript",
  "text/ecmascript"
]);

/**
 * B"H
 * Tests whether a content-type looks like JavaScript.
 *
 * @param {string} contentType
 * Header text from the server.
 *
 * @returns {boolean}
 * True when the server is sending browser-importable JavaScript.
 */
export function isJavaScriptMime(contentType = "") {
  const normalized = String(contentType).toLowerCase();
  return JAVASCRIPT_MIME_SIGNS.some(sign => normalized.includes(sign));
}

/**
 * B"H
 * Fetches a module URL before import so we can give a clear failure
 * instead of a vague dynamic import fatality.
 *
 * @param {string} path
 * Relative or absolute module path.
 *
 * @param {string} label
 * Human name for error messages.
 *
 * @returns {Promise<PreflightResult>}
 * The preflight report.
 */
export async function preflightModule(path, label = "module") {
  const url = new URL(path, import.meta.url).href;

  let response;
  let bodyPreview = "";

  try {
    response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Accept": "text/javascript, application/javascript, */*;q=0.1"
      }
    });
  } catch (error) {
    throw new Error(
      `B"H - Preflight could not reach ${label}: ${url}. Network/server failure: ${error.message}`,
      { cause: error }
    );
  }

  const contentType = response.headers.get("content-type") || "";

  try {
    const clone = response.clone();
    bodyPreview = (await clone.text()).slice(0, 500);
  } catch (error) {
    bodyPreview = "";
  }

  const result = {
    ok: response.ok && isJavaScriptMime(contentType),
    url,
    status: response.status,
    contentType,
    bodyPreview
  };

  if (!response.ok) {
    throw new Error(
      `B"H - ${label} returned HTTP ${response.status} at ${url}. ` +
      `Your custom server is probably returning JSON/HTML 404 instead of the JS file. ` +
      `Body preview: ${bodyPreview}`
    );
  }

  if (!isJavaScriptMime(contentType)) {
    throw new Error(
      `B"H - ${label} returned wrong MIME type "${contentType}" at ${url}. ` +
      `For .js module files the server must return text/javascript or application/javascript. ` +
      `Body preview: ${bodyPreview}`
    );
  }

  return result;
}

/**
 * B"H
 * Preflights and then dynamically imports a module.
 *
 * @param {string} path
 * Relative or absolute module path.
 *
 * @param {string} label
 * Human name for diagnostics.
 *
 * @returns {Promise<any>}
 * Imported ES module namespace object.
 */
export async function importCheckedModule(path, label = "module") {
  const report = await preflightModule(path, label);
  console.log(`B"H - [MODULE_PREFLIGHT_OK]: ${label}`, report);
  return await import(path);
}