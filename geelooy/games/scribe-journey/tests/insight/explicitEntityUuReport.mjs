// B"H
// tests/insight/explicitEntityUuReport.mjs

import { maps } from '../../js/data/maps.js';

/**
 * Chapter 5: A green placement report is not enough. This report proves every
 * active interactable has an explicit inner Unicode identity, not a borrowed
 * visual costume.
 */
function buildReport() {
  const missing = [];
  const duplicateLevelGlyphs = [];
  const badVisualMasks = [];

  for (const [mapId, map] of Object.entries(maps)) {
    const seen = new Map();
    for (const [coord, entity] of Object.entries(map.interactables || {})) {
      if (!entity.uu) {
        missing.push({ mapId, coord, id: entity.id, type: entity.type, emoji: entity.emoji });
      }
      const glyph = entity.uu || entity.glyph;
      if (glyph) {
        if (seen.has(glyph)) duplicateLevelGlyphs.push({ mapId, glyph, first: seen.get(glyph), second: entity.id });
        seen.set(glyph, entity.id);
      }
      if (entity.uu && !entity.visual && !entity.emoji) {
        badVisualMasks.push({ mapId, coord, id: entity.id, uu: entity.uu });
      }
    }
  }

  return {
    mapCount: Object.keys(maps).length,
    missingExplicitUuCount: missing.length,
    duplicateLevelGlyphCount: duplicateLevelGlyphs.length,
    badVisualMaskCount: badVisualMasks.length,
    firstMissingExplicitUu: missing.slice(0, 24),
    firstDuplicateLevelGlyphs: duplicateLevelGlyphs.slice(0, 12),
    firstBadVisualMasks: badVisualMasks.slice(0, 12)
  };
}

const report = buildReport();
console.log(JSON.stringify(report, null, 2));
if (report.missingExplicitUuCount || report.duplicateLevelGlyphCount || report.badVisualMaskCount) process.exit(1);
