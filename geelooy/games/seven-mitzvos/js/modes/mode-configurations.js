//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ModeConfigurations
 * @description
 * Story, Sandbox, Scenario, Survival, Legacy, and Challenge modes on
 * Awtsmoos.com declare bounded rules rather than forking moral truth. The
 * Awtsmoos is one; finite modes reveal different decisions and pressures.
 */
export const MODE_CONFIGURATIONS = Object.freeze({
	story: mode('story', { authoredArcs: 7, branchingAlliances: true, postCampaignSandbox: true }),
	sandbox: mode('sandbox', { configurableSeed: true, openPlay: true, victoryConditions: 'optional' }),
	scenario: mode('scenario', { fixedObjectives: true, authoredCrisis: true, replaySeed: true }),
	survival: mode('survival', { scarceSupplies: true, severeWeather: true, limitedSaves: 'optional' }),
	legacy: mode('legacy', { generations: true, inheritance: true, evolvingLaws: true, ecologyHistory: true }),
	challenge: mode('challenge', { verifiedSeed: true, archivedSeason: true, separateRules: true })
});

export const INITIAL_SCENARIOS = Object.freeze([
	'rebuild-after-flood',
	'resolve-regional-famine',
	'repair-corrupt-court',
	'protect-trade-route',
	'restore-public-trust',
	'stop-escalating-conflict',
	'rescue-failing-sanctuary',
	'stabilize-divided-city',
	'restore-polluted-water',
	'integrate-migration-wave',
	'rebuild-archive-after-fire',
	'resolve-labor-crisis'
]);

function mode(id, rules) {
	return Object.freeze({ id, rules: Object.freeze(rules) });
}
