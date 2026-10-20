// BH
// Boruch Hashem
// Blessed is He

/**
 * @module CommentaryProvider
 * @description
 * Bridges classical commentaries (Rashi, and future Rishonim) into the
 * Awtsmoos comment system. Each commentary unit becomes a comment with
 * the commentator's @alias, anchored by dibur (the opening words).
 *
 * The comment section is the UI — no separate toggle buttons.
 */

import { fetchRashiUnits, unitsForDaf, rashiSlugFor } from "../rashi/rashi-api.js?v=rashi-001";

/**
 * Detects Bavli daf context from the current page.
 * @returns {{masechta, daf, slug}|null}
 */
function detectBavliContext() {
  const post = window.post || {};
  if (post.masechta && (post.vilnaDaf || post.vilnaDaf === 0)) {
    const slug = rashiSlugFor(post.masechta);
    if (slug) return { masechta: post.masechta, daf: String(post.vilnaDaf), slug };
  }
  const m = location.pathname.match(/\/heichelos\/[^/]+\/series\/([^/]+)\/post\/([^/?#]+)/);
  if (!m) return null;
  const seriesId = decodeURIComponent(m[1]);
  const postId = decodeURIComponent(m[2]);
  let dm = postId.match(/^bavli-(.+)-daf(\d+)$/i);
  if (dm) {
    const slug = rashiSlugFor(dm[1]);
    if (slug) return { masechta: dm[1], daf: dm[2], slug };
  }
  dm = postId.match(/-(\d+[ab])$/i);
  if (dm) {
    const daf = dm[1].toLowerCase();
    const masechta = postId.slice(0, postId.length - daf.length - 1);
    const slug = rashiSlugFor(masechta) || rashiSlugFor(seriesId);
    if (slug) return { masechta, daf, slug };
  }
  const slug = rashiSlugFor(seriesId);
  if (slug) return { masechta: seriesId, daf: null, slug };
  return null;
}

/**
 * Converts a Rashi unit to Awtsmoos comment format.
 */
function rashiUnitToComment(unit, index) {
  return {
    id: `rashi-${unit.ref || index}`,
    alias: "rashi",
    aliasId: "rashi",
    commentator: "Rashi",
    commentator_name: "Rabbi Shlomo Yitzchaki",
    // The dibur (opening words) anchors the comment to the text
    anchor: unit.dibur || "",
    dibur: unit.dibur || "",
    ref: unit.ref || "",
    // Content: Hebrew + English
    text: unit.english || unit.hebrew || "",
    textHeb: unit.hebrew || "",
    textEng: unit.english || "",
    // Mark as commentary (not user-generated)
    kind: "commentary",
    source: "rashi-bavli",
    createdAt: Date.now(),
  };
}

/**
 * Fetches Rashi commentary as comments for the current Bavli page.
 * @returns {Promise<Array>} comments in Awtsmoos format
 */
export async function fetchRashiComments() {
  const ctx = detectBavliContext();
  if (!ctx) return [];
  try {
    const units = await fetchRashiUnits(ctx.slug, ctx.daf);
    const filtered = ctx.daf ? unitsForDaf(units, ctx.daf) : units;
    return filtered.map((u, i) => rashiUnitToComment(u, i));
  } catch (e) {
    console.warn("BH commentary provider: Rashi fetch failed", e);
    return [];
  }
}

/**
 * Returns true if the current page has commentary available.
 */
export function hasCommentaryAvailable() {
  return detectBavliContext() !== null;
}

/**
 * The list of commentary aliases available on this page.
 * Currently: ["rashi"]. Future: ["rashi", "tosafot", "ramban", ...]
 */
export function availableCommentaryAliases() {
  return hasCommentaryAvailable() ? ["rashi"] : [];
}
