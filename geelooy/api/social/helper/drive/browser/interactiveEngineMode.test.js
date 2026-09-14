//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves browser engine modes are explicit, isolated, and non-secret.
 * @description
 * Headless and provider-compatibility Chromium may serve one account without sharing
 * an active process profile or accepting invented presentation modes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { normalizeInteractiveEngineMode } = require('./interactiveEngineMode.js');
const { InteractiveProfileStore } = require('./interactiveProfileStore.js');
const { InteractiveSessionService } = require('./interactiveSessionService.js');

test('engine vocabulary defaults safely and rejects invented modes', () => {
	assert.equal(normalizeInteractiveEngineMode(), 'headless');
	assert.equal(normalizeInteractiveEngineMode('compatibility'), 'compatibility');
	assert.throws(
		() => normalizeInteractiveEngineMode('stealth'),
		error => error.code === 'INTERACTIVE_ENGINE_MODE_INVALID'
	);
});

test('profile paths isolate headless and compatibility engines', testContext => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-browser-mode-'));
	testContext.after(() => fs.rmSync(root, { force: true, recursive: true }));
	const store = new InteractiveProfileStore({ root });
	const headless = store.prepare('user-1', 'main', 'headless');
	const compatibility = store.prepare('user-1', 'main', 'compatibility');
	assert.notEqual(headless.profilePath, compatibility.profilePath);
	assert.equal(headless.ownerKey, compatibility.ownerKey);
	assert.equal(headless.engineMode, 'headless');
	assert.equal(compatibility.engineMode, 'compatibility');
});

test('same jar reuses only a session with the same engine mode', async () => {
	const started = [];
	const service = new InteractiveSessionService({
		profileStore: fakeProfileStore(),
		startRuntime: async input => {
			started.push(input.engineMode);
			return fakeRuntime(started.length, input.url);
		},
		stopRuntime: async () => {},
		idleMs: 60_000
	});	const first = await service.create({
		engineMode: 'headless',
		jarId: 'main',
		url: 'https://example.com/',
		userId: 'user-1'
	});
	const second = await service.create({
		engineMode: 'headless',
		jarId: 'main',
		url: 'https://example.org/',
		userId: 'user-1'
	});
	const third = await service.create({
		engineMode: 'compatibility',
		jarId: 'main',
		url: 'https://chatgpt.com/',
		userId: 'user-1'
	});
	assert.equal(first.sessionId, second.sessionId);
	assert.notEqual(first.sessionId, third.sessionId);
	assert.deepEqual(started, ['headless', 'compatibility']);
	assert.equal(third.engineMode, 'compatibility');
	assert.doesNotMatch(JSON.stringify(third), /profilePath|debugPort|proxyPort/);
});

function fakeProfileStore() {
	return {
		prepare(userId, jarId, engineMode) {
			return {
				engineMode,
				jarId,
				ownerKey: `${userId}:${jarId}`,
				profilePath: `/private/${userId}/${jarId}/${engineMode}`
			};
		}
	};
}

function fakeRuntime(number, initialUrl) {
	const targets = [{ id: `root-${number}`, title: 'Root', type: 'page', url: initialUrl }];
	return {
		rootTargetId: targets[0].id,
		devtools: {
			async listTargets() {
				return targets;
			},
			async createTarget(url) {
				const target = { id: `tab-${number}-${targets.length}`, title: 'Tab', type: 'page', url };
				targets.push(target);
				return target;
			}
		},
		controller: {}
	};
}
