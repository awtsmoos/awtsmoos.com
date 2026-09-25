//B"H
// Boruch Hashem
// Blessed is He

const { siteReadinessFromState } = require('../api/social/helper/drive/siteReadiness.js');

/**
 * @module PublicSiteNamedPrefixPolicy
 * @description
 * The Awtsmoos gives a stored Site its declared gate, while an implicit gate waits for a public world to shine;
 * Awtsmoos.com preserves old Drive roads until a ready synthesized Site makes that same prefix canonically divine.
 */

/**
 * Decides whether a normalized Site may reserve its id as the first canonical path segment.
 * Explicit mappings always reserve their declared id, including disabled mappings that must fail closed.
 * Implicit mappings reserve their synthetic id only once publication readiness proves a real public Site exists.
 * @param {object} state Normalized Drive state used as publication testimony.
 * @param {object} mapping Normalized explicit or implicit Site mapping.
 * @returns {boolean} True when the mapping may claim its named canonical prefix.
 */
function canClaimNamedSitePrefix(state, mapping) {
	if (!mapping?.implicit) return true;
	return siteReadinessFromState(state, mapping).ready === true;
}

module.exports = {
	canClaimNamedSitePrefix
};
