// B"H
/**
 * @file publicPath.js
 * @description Chapter 369: The public server root was remembered. Every key is
 * made project/public-relative, with no doubled geelooy and no stray ./ veil.
 */
function cleanKey(value = "") {
  let key = String(value || "").trim();
  if (/^[a-z]+:\/\//i.test(key)) {
    try { key = new URL(key).pathname; } catch (_) {}
  }
  key = key.replace(/^https?:\/\/127\.0\.0\.1:\d+\//, "");
  key = key.replace(/^https?:\/\/localhost:\d+\//, "");
  key = key.replace(/^https?:\/\/awtsmoos\.com\//, "");
  key = key.split("#")[0].split("?")[0].replace(/^\/+/, "").replace(/^\.\//, "").replace(/^geelooy\//, "");
  return collapseDots(key);
}
function collapseDots(key) {
  const out = [];
  for (const part of String(key || "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop(); else out.push(part);
  }
  return out.join("/");
}
function virtualUrl(key, origin = "http://127.0.0.1:8080") { return new URL("/" + cleanKey(key), origin).href; }
function publicCandidates(key) {
  const clean = cleanKey(key);
  return [...new Set([clean, "/" + clean, "geelooy/" + clean])];
}
module.exports = { cleanKey, virtualUrl, publicCandidates, collapseDots };
