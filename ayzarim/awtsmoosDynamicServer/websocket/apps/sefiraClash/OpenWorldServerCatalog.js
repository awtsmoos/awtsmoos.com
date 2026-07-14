//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server catalog mirrors stable lived-world ids without importing browser modules. The
 * Awtsmoos renews client and server vocabulary together; Awtsmoos.com rejects invented
 * missions, rooms, citizens, and provisions before persisted profile truth is considered.
 */

const OPEN_WORLD_MISSION_IDS = new Set([
	'bread-for-a-neighbor',
	'discipline-of-hands',
	'feet-on-the-road',
	'city-circuit',
	'measured-spar',
	'rest-and-return',
	'meet-the-city',
	'archive-clue',
	'clinic-round',
	'prepared-passage',
	'common-table',
	'council-ear',
	'guesthouse-news',
	'three-point-patrol',
	'quiet-investigation',
	'guard-with-restraint'
]);

const OPEN_WORLD_INTERIOR_IDS = new Set([
	'shlichus',
	'market',
	'training',
	'hideout',
	'archive',
	'clinic',
	'ferry',
	'kitchen',
	'council',
	'guesthouse'
]);

const OPEN_WORLD_CITIZEN_IDS = new Set([
	'malka-board',
	'dovid-market',
	'ruth-watch',
	'yosef-ferry',
	'miriam-clinic',
	'eli-courier',
	'hannah-archive',
	'meir-council',
	'tamar-rumor',
	'naftali-runner',
	'yael-trainer',
	'asher-gardener',
	'shimon-mediator',
	'leah-kitchen',
	'uri-musician',
	'dinah-watch',
	'gideon-trainer',
	'avital-council',
	'chesed-cook',
	'noa-clinic',
	'avraham-host',
	'sarah-archive',
	'eliezer-board',
	'deborah-clue',
	'shlomo-scholar',
	'ari-artisan',
	'rivka-ferry',
	'keter-elder',
	'batya-board',
	'ezra-keeper'
]);

const OPEN_WORLD_PROVISION_IDS = Object.freeze(['meal', 'tea', 'map', 'rumor', 'passage']);

module.exports = {
	OPEN_WORLD_CITIZEN_IDS,
	OPEN_WORLD_INTERIOR_IDS,
	OPEN_WORLD_MISSION_IDS,
	OPEN_WORLD_PROVISION_IDS
};
