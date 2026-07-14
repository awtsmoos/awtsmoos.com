// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos opens one complete schema-four save vessel. Every future load begins
 * from these finite defaults before older history is merged into place.
 */
export function createDefaultSave() {
	return {
		schemaVersion: 4,
		best: 0,
		bestMass: 0,
		stars: {},
		unlocked: 0,
		currentLevel: 0,
		selectedChapter: 0,
		selectedMode: 'classic',
		modeRecords: {},
		achievements: {},
		daily: {},
		collection: {},
		perf: 'high',
		haptics: true,
		postfx: true,
		uiScale: 1,
		sparks: 0,
		perutot: 0,
		upgradeTiers: { draw: 0, surge: 0, grace: 0, abundance: 0 },
		talentTiers: { chochmah: 0, binah: 0, gevurah: 0, chesed: 0, tiferet: 0 },
		levelRecords: {},
		questProgress: {},
		claimedQuestRewards: {},
		campaignReceipts: {},
		campaignStats: { wins: 0, bossWins: 0, masteryWins: 0, totalMass: 0 },
		adventureRecords: {},
		adventureStats: { attempts: 0, completions: 0, totalPerutot: 0, bestPerutot: 0 },
		multiplayerRoom: 'malchus'
	};
}
