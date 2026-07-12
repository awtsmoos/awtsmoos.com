// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Wrap = require('../tools/command/missionWrap.js');
const Lock = require('../tools/fs/mission/lock/index.js');

/** B"H — Mission memory may advise explicit work, but never seize the foreground. */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-wrap-'));
	const config = {
		root,
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: '/bin/sh' }
	};
	try {
		const ordinary = await Wrap.run(config, {
			action: 'commandRun',
			command: 'echo ordinary'
		}, async () => ({ ok: true, action: 'commandRun', finalAnswerAllowed: true }));
		assert.equal(ordinary.finalAnswerAllowed, true);
		assert.equal(ordinary.missionAdvisory, undefined);
		assert.equal(Lock.active(config), null);

		const explicit = await Wrap.run(config, {
			action: 'commandRun',
			command: 'echo explicit',
			mission: true
		}, async () => ({ ok: true, action: 'commandRun', finalAnswerAllowed: true }));
		assert.equal(explicit.finalAnswerAllowed, true);
		assert.equal(explicit.mustContinue, false);
		assert.equal(explicit.missionLockActive, false);
		assert.equal(explicit.missionStatus.active, true);
		assert.equal(explicit.missionStatus.advisory, true);
		assert.equal(explicit.missionAdvisory.blocked, false);
		assert.equal(explicit.missionAdvisory.resumeAvailable, true);
		assert.equal(Lock.active(config).missionId, explicit.missionStatus.missionId);
		console.log(JSON.stringify({ ok: true, suite: 'command-mission-advisory' }, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exit(1);
});
