// B"H
const { cleanKey, virtualUrl } = require("./publicPath.js");

/** B"H: fetches missing same-origin public files from the running Awtsmoos server. */
async function fetchPublicModule(key, options = {}) {
  if (!options.allowUrlFetch) return null;
  const url = virtualUrl(cleanKey(key), options.origin || options.url || "http://127.0.0.1:8080");
  try {
    const res = await fetch(url, { headers: { accept: "text/javascript,text/css,application/json,*/*" } });
    if (!res.ok) return null;
    const text = await res.text();
    return looksLikeHtmlError(text) ? null : text;
  } catch (_) { return null; }
}
function looksLikeHtmlError(text) { return /DYN_ROUTE_NOT_FOUND|Dynamic route not found/.test(String(text || "")); }
module.exports = { fetchPublicModule };
