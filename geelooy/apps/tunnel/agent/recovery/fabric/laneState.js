// B"H
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @file laneState.js
 * @description Every rescue lane owns a private little shore of disk. Its
 * memory does not disappear merely because a sibling process or database does.
 */
function createLaneState(laneId, stateRoot) {
	const root = path.resolve(
		stateRoot || path.join(process.cwd(), '.awtsmoos-recovery', laneId)
	);
	const handoffs = path.join(root, 'handoffs');
	fs.mkdirSync(handoffs, { recursive: true });
	return Object.freeze({
		laneId,
		root,
		missionPath: path.join(root, 'mission.json'),
		latestHandoffPath: path.join(root, 'latest-handoff.json'),
		handoffs
	});
}

module.exports = { createLaneState };
