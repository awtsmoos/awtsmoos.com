//B"H
const { rewriteBody } = require("./rewriteText.cjs");
const { mayRewriteBody } = require("./bodyPolicy.cjs");
const { jsPreamble } = require("./jsPreamble.cjs");

/**
 * Chapter 23: The Body Chose The Smallest Honest Change.
 *
 * HTML stays still for hydration. Route data and APIs stay raw. JavaScript
 * receives only a tiny fetch/XHR nerve so absolute ChatGPT requests return to
 * the local dynamic proxy instead of dying in CORS fire.
 *
 * @param {Buffer} bytes Upstream response bytes.
 * @param {string} type Upstream content-type.
 * @param {URL} local Local request URL.
 * @param {string} origin Upstream origin.
 * @returns {{body:Buffer|string,rewrite:boolean,mode:string}}
 */
function transformBody(bytes, type, local, origin) {
  if (/javascript|ecmascript/i.test(type || "")) return { body: jsPreamble(origin) + bytes.toString("utf8"), rewrite: true, mode: "js-preamble" };
  const rewrite = mayRewriteBody(local, type);
  return { body: rewrite ? rewriteBody(bytes, type, origin) : bytes, rewrite, mode: rewrite ? "html" : "raw" };
}

module.exports = { transformBody };
