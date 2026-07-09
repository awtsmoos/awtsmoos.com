// B"H
/**
 * @file GroundTextureConfig.js
 * @description Hosted ground texture covenant for Mitzvah World terrain.
 *
 * The Awtsmoos gives the earth many garments: grass, dirt, dust, and the quiet
 * in-between. This file names those garments once so shader code can stay a
 * clean vessel and every caller can add more layers without rewriting GLSL by
 * hand.
 */
export const DEFAULT_GROUND_TEXTURE_URLS = Object.freeze([
  "https://awtsmoos-docs-base.web.app/full-resolution/grass%201.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%203.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%202.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%20grass%201.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/dirt%202.png",
  "https://awtsmoos-docs-base.web.app/full-resolution/grass1.png"
]);

export function normalizeGroundTextureUrls(urls = DEFAULT_GROUND_TEXTURE_URLS) {
  const list = Array.isArray(urls) ? urls : DEFAULT_GROUND_TEXTURE_URLS;
  const clean = list.map(url => String(url || "").trim()).filter(Boolean);
  return clean.length ? [...new Set(clean)] : [...DEFAULT_GROUND_TEXTURE_URLS];
}
