// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { journeyToQuest } from '../../js/workers/systems/quests/questJourney.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const state = createDefaultGameState();
state.player.level = 10;
state.db.quests = {
	journey_test: {
		id: 'journey_test',
		title: 'Journey to the Orchard',
		level: 1,
		objectives: [{
			id: 'reach_orchard',
			type: 'reach_map',
			targetId: 'malkuth_orchard',
			mapId: 'malkuth_orchard',
			required: 1,
			text: 'Reach the Orchard of First Echoes'
		}]
	}
};
assert(Quests.accept(state, 'journey_test'), 'Journey quest could not be accepted.');
const notices = [];
assert(journeyToQuest(state, 'journey_test', (message, type) => notices.push({ message, type })), 'Journey action failed.');
assert(state.currentMapId === 'malkuth_orchard', 'Journey did not change maps.');
assert(state.player.pixelX === state.player.x * 40, 'Journey did not synchronize horizontal pixels.');
assert(state.player.pixelY === state.player.y * 40, 'Journey did not synchronize vertical pixels.');
assert(Quests.getStatus(state, 'journey_test') === 'ready', 'Reach-map objective did not complete during Journey.');
assert(notices.some(entry => entry.message.includes('Journeyed')), 'Journey feedback was not emitted.');

console.log(JSON.stringify({
	ok: true,
	mapId: state.currentMapId,
	x: state.player.x,
	y: state.player.y,
	notices: notices.length
}, null, 2));
