// B"H
'use strict';

const path = require('path');
const { lane } = require('./laneCatalog');
const { policy } = require('./lanePolicy');
const { createLaneState } = require('./laneState');
const { createLaneServer } = require('./laneHttp');

/**
 * @file laneProcess.js
 * @description One rescue island, one process, one port, one private state
 * root. It needs no DosDB, task runner, mail, AI, publishing, or main app.
 */
function main() {
	const laneId = process.env.AWTSMOOS_RECOVERY_LANE_ID || process.argv[2];
	const definition = lane(laneId);
	const port = Number(process.env.AWTSMOOS_RECOVERY_PORT || definition.port);
	const stateRoot = process.env.AWTSMOOS_RECOVERY_STATE_ROOT || path.join(
		process.cwd(),
		'.awtsmoos-recovery',
		laneId
	);
	const state = createLaneState(laneId, stateRoot);
	const server = createLaneServer({
		definition,
		state,
		policy: policy(laneId)
	});
	server.listen(port, '127.0.0.1', () => {
		console.log(`B"H recovery lane ${laneId} listening on 127.0.0.1:${port}`);
	});
}

if (require.main === module) main();
module.exports = { main };
