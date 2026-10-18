// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const FileLane = require('../recovery/lanes/fileTrigger.js');

/** Exercises actual filesystem event notification without touching user files. */
async function fixture(options, verify) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-file-lane-'));
	const token = crypto.randomBytes(12).toString('hex');
	const kernel = { recoveryRoot: root, execute(action) { return { ok: action === 'status', state: 'healthy' }; } };
	const lane = FileLane.create({ root: path.join(root, 'file-recovery'), kernel, token, ...options });
	try {
		const begun = lane.start();
		await verify({ root: lane.root, token, begun });
	} finally {
		lane.stop();
		fs.rmSync(root, { recursive: true, force: true });
	}
}

async function request(root, token) {
	const name = crypto.randomBytes(5).toString('hex') + '.json';
	const inbox = path.join(root, 'inbox');
	const source = path.join(inbox, name + '.tmp');
	const destination = path.join(inbox, name);
	const outbox = path.join(root, 'outbox', name);
	const start = Date.now();
	fs.writeFileSync(source, JSON.stringify({ token, action: 'status' }), { mode: 0o600 });
	fs.renameSync(source, destination);
	for (let i = 0; i < 70; i++) {
		if (fs.existsSync(outbox)) {
			return { elapsedMs: Date.now() - start, value: JSON.parse(fs.readFileSync(outbox, 'utf8')) };
		}
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	throw new Error('file_lane_did_not_respond');
}

test('event-driven file recovery resolves atomic requests before 500ms periodic watchdog', async () => {
	await fixture({ intervalMs: 500 }, async ({ root, token, begun }) => {
		assert.equal(begun.eventDriven, true);
		for (let i = 0; i < 5; i++) {
			const received = await request(root, token);
			assert.equal(received.value.state, 'healthy');
			assert(received.elapsedMs < 350, `request took ${received.elapsedMs}ms`);
		}
	});
});

test('event watcher failure uses bounded periodic recovery and rejects bad tokens', async () => {
	await fixture({ intervalMs: 100, makeWatcher() { throw new Error('watch_unavailable'); } }, async ({ root, token, begun }) => {
		assert.equal(begun.eventDriven, false);
		const received = await request(root, token);
		assert(received.elapsedMs < 700);
		assert.equal(received.value.ok, true);
		const rejected = await request(root, 'incorrect-token');
		assert.equal(rejected.value.ok, false);
		assert.equal(rejected.value.error, 'local_recovery_unauthorized');
	});
});
