// B"H
// Boruch Hashem
// Blessed is He

import { objective as o } from './questFactory.js';

const EVENTS = [
	['malkuth', 'malkuth_village', 'Blankling Return'],
	['yesod', 'moonwell_hamlet', 'Dream Tide'],
	['hod', 'brass_market', 'Archive Wind'],
	['netzach', 'rootbound_camp', 'Canopy Migration'],
	['tiferet', 'mirror_lake', 'Festival of Reflections'],
	['gevurah', 'ember_barracks', 'Trial Without Sentence'],
	['chesed', 'orchard_guests', 'Caravan of Open Hands'],
	['binah', 'black_garden', 'Third Night Bloom'],
	['chokhmah', 'lightning_monastery', 'Vessel Storm'],
	['keter', 'crownless_city', 'The City Remembers']
];

function dateKey(date) {
	return date.toISOString().slice(0, 10).replaceAll('-', '');
}

/** Generates one deterministic regional event for each UTC day after ending. */
export function generatePostgameWorldEvent(date = new Date()) {
	const dayIndex = Math.floor(date.getTime() / 86400000);
	const [regionId, mapId, title] = EVENTS[Math.abs(dayIndex) % EVENTS.length];
	const id = `postgame_event_${dateKey(date)}`;
	return {
		id,
		chainId: 'postgame_rotating_events',
		sequence: dayIndex,
		title,
		summary: `A rotating ${regionId} world event asks restored communities to act together.`,
		category: 'event',
		regionId,
		level: 81,
		giverId: 'tamar',
		turnInId: 'tamar',
		prerequisites: ['campaign_keter_08'],
		objectives: [
			o('reach_map', mapId, 1, `Reach the active event in ${mapId}`, mapId),
			o('protect_target', `${regionId}_world_event`, 120, 'Protect the event for 2 minutes', mapId),
			o('survive_waves', `${regionId}_world_event_wave`, 4, 'Survive 4 escalating waves', mapId),
			o('restore_relationship', `${regionId}_event_bond`, 3, 'Restore 3 community bonds', mapId)
		],
		rewards: {
			playerXp: 900,
			money: 250,
			reputation: [{ factionId: `${regionId}_community`, amount: 100 }],
			items: [{ itemId: 'echo_shard', quantity: 3 }]
		}
	};
}
