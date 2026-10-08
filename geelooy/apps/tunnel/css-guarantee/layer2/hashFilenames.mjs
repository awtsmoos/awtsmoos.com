//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 6 (Deploy-Time Cache-Busting Filenames) of the Airtight CSS Guarantee System.
 * @description Browsers cache CSS aggressively, so a deploy that only changes file
 * *content* can keep serving the stale sheet. At deploy time this module renames
 * every CSS file to include an 8-char content hash
 * (`meluket-sefer.css` -> `meluket-sefer.a1b2c3d4.css`) and rewrites the
 * `<link rel="stylesheet" href="...">` tags in HTML to point at the hashed
 * names, so each content change is a brand-new URL the browser cannot have cached. B"H.
 */

import { createHash } from "node:crypto";

/**
 * Hash a CSS filename with its content: `meluket-sefer.css` + content
 * -> `meluket-sefer.a1b2c3d4.css` (8-char sha1 of content).
 * Deterministic: same name + same content always yields the same filename.
 *
 * @param {string} originalName - e.g. "meluket-sefer.css"
 * @param {string|Buffer} content - the file's content
 * @returns {string} hashed filename
 */
export function hashFilename(originalName, content) {
  const hash = createHash("sha1").update(content).digest("hex").slice(0, 8);
  const dot = originalName.lastIndexOf(".");
  if (dot === -1) return `${originalName}.${hash}`;
  return `${originalName.slice(0, dot)}.${hash}${originalName.slice(dot)}`;
}

/**
 * Rewrite `<link>` stylesheet hrefs in HTML per a `{ original: hashed }` mapping.
 * Handles single/double quotes, extra attributes, any attribute order, and
 * mixed-case tags. Hrefs with no mapping entry are left untouched.
 *
 * @param {string} htmlContent - raw HTML text
 * @param {Record<string, string>} mapping - { "old.css": "old.a1b2c3d4.css" }
 * @returns {string} HTML with mapped hrefs replaced
 */
export function rewriteHtmlLinks(htmlContent, mapping) {
  return htmlContent.replace(/<link\b[^<>]*>/gi, (tag) => {
    return tag.replace(
      /(href\s*=\s*)(['"])([^'"]*)\2/i,
      (match, prefix, quote, href) => {
        const mapped = mapping[href];
        if (mapped === undefined) return match;
        return `${prefix}${quote}${mapped}${quote}`;
      }
    );
  });
}
