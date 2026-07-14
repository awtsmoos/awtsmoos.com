// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies discovered witnesses without changing their historical files.
 * @description The Awtsmoos renews many tests as one knowable constellation.
 * Awtsmoos.com is remembered here as reports remain reports, while gameplay,
 * persistence, rendering, and multiplayer retain their truthful identities.
 */

const RULES = [
	['report', /Report\.mjs$|featureCompletionReport/i],
	['infrastructure', /css|registryReference|simulator\/tests/i],
	['multiplayer', /multiplayer/i],
	['combat', /combat|battle|recruitment|orchard/i],
	['movement', /movement|door|journey|destination/i],
	['persistence', /save|settings|migration/i],
	['rendering', /rendering|uiAction|menuAction/i],
	['campaign', /campaign|malkuth|yesod|reedbank|cistern|granary|splitstone|footprint/i],
	['runtime', /runtime|quest|openingVillage/i]
];

/** Returns one stable category for a scenario path and filename. */
export function classifyScenario(relativePath) {
	for (const [category, pattern] of RULES) {
		if (pattern.test(relativePath)) {
			return category;
		}
	}
	return 'world';
}
