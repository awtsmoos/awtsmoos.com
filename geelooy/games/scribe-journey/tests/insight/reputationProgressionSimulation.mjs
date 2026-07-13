// B"H
// Boruch Hashem
// Blessed is He

import { buildReputationPayload } from '../../js/workers/systems/quests/reputationPresentation.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const player = {
	reputation: {
		malkuth_community: 0,
		yesod_community: 100,
		hod_community: 250,
		netzach_community: 500,
		keter_community: 900
	}
};

const payload = buildReputationPayload(player);
const byFaction = Object.fromEntries(payload.map(entry => [entry.factionId, entry]));

assert(byFaction.malkuth_community.rank === 'Unknown', 'Zero reputation should be Unknown.');
assert(byFaction.yesod_community.rank === 'Recognized', '100 reputation should be Recognized.');
assert(byFaction.hod_community.rank === 'Trusted', '250 reputation should be Trusted.');
assert(byFaction.netzach_community.rank === 'Honored', '500 reputation should be Honored.');
assert(byFaction.keter_community.rank === 'Keeper', '900 reputation should be Keeper.');
assert(byFaction.malkuth_community.nextRank === 'Recognized', 'Unknown should point to Recognized.');
assert(byFaction.keter_community.nextRank === null, 'Keeper should be the maximum rank.');
assert(payload[0].factionId === 'keter_community', 'Reputation presentation should sort highest first.');

console.log(JSON.stringify({
	ok: true,
	factions: payload.length,
	ranks: payload.map(entry => entry.rank)
}, null, 2));
