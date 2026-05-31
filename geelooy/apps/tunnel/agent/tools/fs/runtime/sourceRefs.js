// B"H
/**
 * @file sourceRefs.js
 * @description
 * Chapter 5: CSS whispered through url() wells, JavaScript called across
 * valleys, and the Awtsmoos bound each whisper into one reachable procession.
 */

const path = require("path");
const { refsFromHtml } = require("./htmlRefs.js");
const { cleanSpec, slash } = require("./pathUtils.js");

function refsFromCss(text = "") {
  const refs = [];
  for (const m of String(text).matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?\s*\)?/gi)) refs.push(m[1]);
  for (const m of String(text).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push(m[1]);
  return refs;
}

function refsFromJs(text = "") {
  const refs = [];
  const source = String(text || "");
  const staticRe = /(?:import\s+(?!\()(?:(?:[\s\S]*?)\s+from\s+)?|export\s+(?:\*|\{[\s\S]*?\})\s+from\s+)["']([^"']+)["']/g;
  for (const m of source.matchAll(staticRe)) refs.push(m[1]);
  for (const m of source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) refs.push(m[1]);
  for (const m of source.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) refs.push(m[1]);
  for (const m of source.matchAll(/\bfetch\s*\(\s*["']([^"']+)["']\s*\)/g)) refs.push(m[1]);
  return refs;
}

function refsFrom(text, fromKey) {
  const refs = [];
  const base = slash(path.dirname(fromKey));
  const add = spec => {
    const clean = cleanSpec(spec);
    if (!clean || /^[a-z]+:/i.test(clean) || clean.startsWith("//") || clean.startsWith("data:")) return;
    refs.push(slash(path.posix.normalize(path.posix.join(base, clean))));
  };
  [...refsFromHtml(text), ...refsFromCss(text), ...refsFromJs(text)].forEach(add);
  return [...new Set(refs)];
}

module.exports = { refsFrom, refsFromCss, refsFromJs };
