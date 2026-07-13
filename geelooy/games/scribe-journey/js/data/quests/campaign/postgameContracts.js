// B"H
// Boruch Hashem
// Blessed is He

import { objective as o } from './questFactory.js';

const CONTRACTS = [
	['malkuth', 'malkuth_granary', 'splitstone_golem', 'Granary Restoration Gauntlet'],
	['yesod', 'sunken_observatory', 'moth_of_unmemory', 'Moonwell Memory Rematch'],
	['hod', 'infinite_stacks', 'lexicon_tyrant', 'Infinite Stacks Classification Trial'],
	['netzach', 'thornheart_grove', 'regal_briar', 'Thornheart Humane Hunt'],
	['tiferet', 'divided_heart_palace', 'twin_crowned_seraph', 'Palace Balance Challenge'],
	['gevurah', 'fortress_measure', 'judgment_colossus', 'Mercy Under Measure'],
	['chesed', 'house_thousand_doors', 'endless_host', 'Open Table Scarcity Trial'],
	['binah', 'womb_stone', 'mater_dolor', 'Patient Forms Challenge'],
	['chokhmah', 'flash_beyond_thought', 'infinite_flash', 'Grounded Insight Sprint'],
	['keter', 'edge_erasure', 'great_erasure', 'Crownless Memory Defense']
];

function contractDefinition(entry, index) {
	const [regionId, mapId, bossId, title] = entry;
	const id = `postgame_contract_${regionId}`;
	return [id, {
		id,
		chainId: 'postgame_elite_contracts',
		sequence: index + 1,
		title,
		summary: `A difficult ${regionId} contract remixes the region's dungeon, boss, and team lessons.`,
		category: 'contract',
		regionId: 'postgame_contracts',
		level: 81,
		giverId: 'tamar',
		turnInId: 'tamar',
		prerequisites: ['campaign_keter_08'],
		objectives: [
			o('reach_map', mapId, 1, `Return to ${mapId}`, mapId),
			o('complete_challenge', `${regionId}_elite_modifier`, 3, 'Complete 3 regional modifiers', mapId),
			o('use_distinct_musag', `${regionId}_contract_roster`, 4, 'Use 4 distinct Musagim', mapId),
			o('win_condition', `${regionId}_limited_resources`, 1, 'Win under the contract restriction', mapId),
			o('defeat_elite', bossId, 1, `Defeat the elevated rematch of ${bossId}`, mapId)
		],
		rewards: {
			playerXp: 1200,
			money: 350,
			reputation: [{ factionId: `${regionId}_community`, amount: 120 }],
			items: [{ itemId: `${regionId}_offering`, quantity: 2 }]
		}
	}];
}

/** Ten postgame contracts preserve regional identity while raising difficulty. */
export const postgameContractQuests = Object.freeze(Object.fromEntries(
	CONTRACTS.map(contractDefinition)
));
