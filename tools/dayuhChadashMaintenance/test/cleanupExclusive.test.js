// B"H

/** @file cleanupExclusive.test.js @description Proves allowlists and handle refusal. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { cleanupDerived } = require('../cleanupDerived.js');
const { assertExclusive, openHandles } = require('../exclusive.js');

function policy(root) {
	return {
		ragRoot: root,
		minimumMaintenanceAgeMs: 0
	};
}

test('derived allowlist removes known work and preserves unknown content', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-derived-'));
	const derived = path.join(root, 'meluket-english-comments-embedding-job');
	const unknown = path.join(root, 'human-content');
	fs.mkdirSync(derived);
	fs.mkdirSync(unknown);
	fs.writeFileSync(path.join(derived, 'work.bin'), 'derived');
	fs.writeFileSync(path.join(unknown, 'keep.bin'), 'keep');
	const result = cleanupDerived(policy(root), { now: Date.now() + 1000 });
	assert(result.removed.some(entry => entry.name === path.basename(derived)));
	assert.equal(fs.existsSync(derived), false);
	assert.equal(fs.existsSync(unknown), true);
	fs.rmSync(root, { recursive: true, force: true });
});

test('active manifest references remain protected', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-active-'));
	const active = path.join(root, 'verify_active_sidecar.txt');
	fs.writeFileSync(active, 'active');
	fs.writeFileSync(path.join(root, 'live.fast-manifest.json'), JSON.stringify({
		metadataSidecar: active
	}));
	cleanupDerived(policy(root), { now: Date.now() + 1000 });
	assert.equal(fs.existsSync(active), true);
	fs.rmSync(root, { recursive: true, force: true });
});

test('exclusive gate accepts empty lsof and rejects live handles', () => {
	const emptyRunner = () => '';
	const liveRunner = () => 'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME\nnode 1 u 3r REG 1 1 1 /x';
	assert.deepEqual(openHandles(['/x'], emptyRunner), []);
	assert.equal(assertExclusive(['/x'], emptyRunner), true);
	assert.throws(
		() => assertExclusive(['/x'], liveRunner),
		error => error.code === 'AWTSMOOS_MAINTENANCE_OPEN_HANDLES'
	);
});
