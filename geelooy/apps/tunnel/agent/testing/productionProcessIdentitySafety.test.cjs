// B"H
const assert = require('node:assert/strict');
const Cleanup = require('../tools/fs/commandJob/processCleanup.js');
const Identity = require('../tools/fs/commandJob/processIdentity.js');

/** B"H — A recycled PID receives no signal because its birth token is different. */
(async () => {
	const expected = Identity.create({
		pid: 4242,
		processGroupId: 4242,
		birthToken: 'original-birth',
		platform: process.platform
	});
	let signals = 0;
	const result = await Cleanup.cleanup(expected, {
		observe: async () => ({
			alive: true,
			pid: 4242,
			processGroupId: 4242,
			birthToken: 'recycled-birth',
			platform: process.platform
		}),
		groupAlive: async () => true,
		signalGroup() {
			signals += 1;
			return { sent: true, signal: 'SIGTERM' };
		}
	});
	assert.equal(result.state, 'identity_unverified');
	assert.equal(result.comparison.reason, 'birth_token_mismatch');
	assert.equal(signals, 0);
	console.log(JSON.stringify({
		ok: true,
		suite: 'production-process-identity-safety',
		state: result.state,
		reason: result.comparison.reason,
		signals
	}, null, 2));
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
