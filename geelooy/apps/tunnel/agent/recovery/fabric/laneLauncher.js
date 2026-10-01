// B"H
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { lane } = require('./laneCatalog');
const { createLaneState } = require('./laneState');
const { saveMission } = require('./missionCapsule');

/**
 * @file laneLauncher.js
 * @description A launcher gives one rescue island birth and then steps aside.
 * The child owns its process, port, state root and log; siblings are optional.
 */
function startLane(options = {}) {
	const laneId = String(options.laneId || '');
	const definition = lane(laneId);
	const state = createLaneState(laneId, options.stateRoot);
	if (options.mission) saveMission(state, options.mission);
	const port = Number(options.port || definition.port);
	const logPath = options.logPath || path.join(state.root, 'lane.log');
	fs.mkdirSync(path.dirname(logPath), { recursive: true });
	const logFd = fs.openSync(logPath, 'a');
	const child = spawn(process.execPath, [path.join(__dirname, 'laneProcess.js'), laneId], {
		detached: options.detached === true,
		stdio: ['ignore', logFd, logFd],
		env: {
			...process.env,
			AWTSMOOS_RECOVERY_LANE_ID: laneId,
			AWTSMOOS_RECOVERY_PORT: String(port),
			AWTSMOOS_RECOVERY_STATE_ROOT: state.root
		}
	});
	if (options.detached === true) child.unref();
	return { child, laneId, port, state, logPath };
}

module.exports = { startLane };
