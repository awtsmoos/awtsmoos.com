// B"H
/**
 * @file inlineScriptRefs.js
 * @description
 * Chapter 99: The Script Was Lifted Out Of The HTML Sea.
 *
 * JavaScript should be scanned as JavaScript, not as an HTML document with
 * comments, attributes, and markup tides. This extractor hands only script
 * bodies to the dependency scanner.
 */
const { refsFromJs } = require("./jsRefs.js");

function refsFromInlineScripts(text = "") {
  const refs = [];
  const scripts = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of String(text || "").matchAll(scripts)) {
    const attrs = match[1] || "";
    if (/type\s*=\s*["']?importmap["']?/i.test(attrs)) continue;
    refs.push(...refsFromJs(match[2] || ""));
  }
  return [...new Set(refs)];
}

module.exports = { refsFromInlineScripts };
