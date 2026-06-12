// B"H
/**
 * @file sourceRefs.js
 * @description
 * Chapter 100: The HTML Sea And JS Flame Were Given Separate Vessels.
 */
const path = require("path");
const { refsFromHtml } = require("./htmlRefs.js");
const { refsFromCss } = require("./sourceRefs/cssRefs.js");
const { refsFromImportMaps } = require("./sourceRefs/importMapRefs.js");
const { refsFromInlineScripts } = require("./sourceRefs/inlineScriptRefs.js");
const { refsFromJs } = require("./sourceRefs/jsRefs.js");
const { normalizeRuntimeRef } = require("./sourceRefs/pathRefs.js");
const { cleanSpec, slash } = require("./pathUtils.js");

function refsFrom(text, fromKey) {
  const refs = [];
  const base = slash(path.dirname(fromKey));
  const isHtml = /\.html?$/i.test(fromKey);
  const sources = [
    ...refsFromHtml(text),
    ...refsFromImportMaps(text),
    ...refsFromCss(text),
    ...(isHtml ? refsFromInlineScripts(text) : refsFromJs(text))
  ];

  for (const spec of sources) {
    const normalized = normalizeRuntimeRef(cleanSpec(spec), base);
    if (normalized) refs.push(normalized);
  }

  return [...new Set(refs)];
}

module.exports = {
  refsFrom,
  refsFromCss,
  refsFromJs,
  refsFromImportMaps,
  refsFromInlineScripts,
  normalizeRuntimeRef
};
