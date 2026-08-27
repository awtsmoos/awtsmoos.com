//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies one guarded Chromium session can reveal many distinct browser targets.
 * @description The Awtsmoos lets windows multiply while the private profile remains one;
 * Awtsmoos.com proves ownership, redaction, reuse, and cleanup before the test is done.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { InteractiveSessionService } = require('./interactiveSessionService.js');

function fixture() {
	const stopped = [];
	let runtimeNumber = 0;
	const service = new InteractiveSessionService({
		profileStore: {
			prepare(userId, jarId) {
				return { jarId, ownerKey: `${userId}:${jarId}`, profilePath: `/private/${userId}/${jarId}` };
			}
		},
		startRuntime: async ({ url }) => fakeRuntime(++runtimeNumber, url),
		stopRuntime: async runtime => stopped.push(runtime.name),
		idleMs: 60_000
	});
	return { service, stopped };
}

test('same user and jar reuse one session while each browser window gets a new target', async () => {
	const { service } = fixture();
	const first = await service.create({ userId: 'u1', jarId: 'main', url: 'https://example.com/' });
	const second = await service.create({ userId: 'u1', jarId: 'main', url: 'https://example.org/' });
	assert.equal(first.sessionId, second.sessionId);
	assert.notEqual(first.targetId, second.targetId);
	const targets = await service.actions.targets('u1', first.sessionId);
	assert.equal(targets.length, 2);
	assert.equal(targets[1].url, 'https://example.org/');
});

test('different owners receive different sessions and cannot borrow session IDs', async () => {
	const { service } = fixture();
	const first = await service.create({ userId: 'u1', jarId: 'main', url: 'https://example.com/' });
	const second = await service.create({ userId: 'u2', jarId: 'main', url: 'https://example.com/' });
	assert.notEqual(first.sessionId, second.sessionId);
	await assert.rejects(
		service.actions.targets('u2', first.sessionId),
		error => error.code === 'INTERACTIVE_SESSION_NOT_FOUND'
	);
});

test('public session metadata redacts process, profile, and debugger internals', async () => {
	const { service } = fixture();
	const created = await service.create({ userId: 'u1', jarId: 'main', url: 'https://example.com/' });
	const serialized = JSON.stringify(created);
	assert.doesNotMatch(serialized, /profilePath|debugPort|proxyPort|webSocketDebuggerUrl|process/);
	assert.equal(created.jarId, 'main');
	assert.ok(created.targetId);
});

test('session deletion stops its runtime exactly once', async () => {
	const { service, stopped } = fixture();
	const created = await service.create({ userId: 'u1', jarId: 'main', url: 'https://example.com/' });
	assert.deepEqual(await service.deleteSession('u1', created.sessionId), { closed: true });
	assert.deepEqual(stopped, ['runtime-1']);
});

function fakeRuntime(number, initialUrl) {
	const targets = [{ id: `root-${number}`, openerId: null, title: 'Root', type: 'page', url: initialUrl }];
	return {
		name: `runtime-${number}`,
		rootTargetId: targets[0].id,
		devtools: {
			async listTargets() {
				return targets;
			},
			async createTarget(url) {
				const target = { id: `tab-${targets.length}`, openerId: null, title: 'Tab', type: 'page', url };
				targets.push(target);
				return target;
			}
		},
		controller: {}
	};
}
