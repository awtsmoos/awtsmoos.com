//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dependency-free contract for configured virtual-OS SSH process boot.
 * @description
 * The Awtsmoos lets a configured doorway awaken before a traveler arrives, while
 * Awtsmoos.com proves an unconfigured development world remains quiet. This contract
 * guards listener lifecycle without minting credentials or touching a real port in rhyme.
 */
const assert = require("node:assert/strict");
const {
	startConfiguredVirtualSsh
} = require("../../../geelooy/api/ssh/virtual/boot.js");

run().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

/**
 * Proves both quiet unconfigured boot and configured singleton startup behavior.
 *
 * @returns {Promise<void>} Completion after both lifecycle branches are witnessed.
 */
async function run() {
	let starts = 0;
	const messages = [];
	const service = {
		async start() {
			starts += 1;
			return {
				running: true,
				startedAt: 12345,
				host: "0.0.0.0",
				port: 2223
			};
		}
	};
	const quiet = await startConfiguredVirtualSsh({
		configured: false,
		service
	});
	assert.equal(quiet.configured, false);
	assert.equal(quiet.running, false);
	assert.equal(starts, 0);
	const alive = await startConfiguredVirtualSsh({
		configured: true,
		service,
		log: message => messages.push(message)
	});
	assert.equal(starts, 1);
	assert.equal(alive.configured, true);
	assert.equal(alive.running, true);
	assert.equal(alive.port, 2223);
	assert.equal(alive.startedAt, 12345);
	assert.match(messages[0], /Virtual OS SSH listening/);
	console.log(JSON.stringify({
		ok: true,
		suite: "virtual-ssh-boot"
	}));
}
