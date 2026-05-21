// B"H
// tests/insight/mapIdentityReport.mjs

import { maps } from '../../js/data/maps.js';

/**
 * Chapter 1: This report walks the cracked roads and counts every place where
 * identity still wears borrowed clothes. It does not judge the world; it reveals
 * where the next repair flame must descend.
 *
 * @returns {object} Summary of entity identity diagnostics.
 */
function buildReport() {
    const entries = Object.entries(maps).map(([id, map]) => ({
        id,
        ambiguous: map.entityDiagnostics?.ambiguousPlacements || [],
        missing: map.entityDiagnostics?.missingPlacements || [],
        duplicates: map.entityIndex?.duplicateGlyphs || []
    }));

    const broken = entries.filter(item => item.ambiguous.length || item.missing.length || item.duplicates.length);
    return {
        mapCount: entries.length,
        brokenMapCount: broken.length,
        firstBroken: broken.slice(0, 12)
    };
}

console.log(JSON.stringify(buildReport(), null, 2));
