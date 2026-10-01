// B"H
'use strict';

const path = require('path');
const { laneIds, lane } = require('./laneCatalog');
const { startLane } = require('./laneLauncher');

/**
 * @file fabricSupervisor.js
 * @description Convenience may launch the islands, but it is not their oxygen.
 * Once born, each lane owns its own process and private rescue state.
 */
function startFabric(options = {}) {
	const root = options.stateRoot || path.join(process.cwd(), '.awtsmoos-recovery');
	return laneIds().map((laneId, index) => startLane({
		laneId,
		port: options.basePort ? Number(options.basePort) + index : lane(laneId).port,
		stateRoot: path.join(root, laneId),
		mission: options.mission,
		detached: options.detached === true
	}));
}

if (require.main === module) {
	const children = startFabric({ detached: true });
	console.log(`B"H launched ${children.length} independent recovery lanes`);
}

module.exports = { startFabric };
