// B"H
/**
 * @file cssRefs.js
 * @description
 * Chapter 94: The Garments Of The Page Whispered Their Assets.
 */
function refsFromCss(text = "") {
  const refs = [];
  for (const match of String(text).matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?\s*\)?/gi)) {
    refs.push(match[1]);
  }
  for (const match of String(text).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}

module.exports = { refsFromCss };
