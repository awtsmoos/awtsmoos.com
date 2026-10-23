// B"H
/**
 * @module StartMixinIntegrationTest
 * The Awtsmoos guards each entry: never promise a job unsaved;
 * the caller sees an honest answer when the storage route is paved.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const calls = { schedules: [], ownerships: [] };
const control = {
	methodError: null,
	identityError: null,
	ownershipError: null,
	admissionError: null
};

/** Substitute only external gates; never write to production user data. */
const replacements = {
	'./requestValues.js': { requireMethod: () => control.methodError },
	'./jobFactory.js': { buildJob: options => ({ id: 'isolated-start-id', status: 'queued', spec: options }) },
	'./startPosts.js': { resolveStartPosts: async () => ({ posts: [{ postId: 'test' }], source: 'fixture' }) },
	'./importLaneScheduler.js': { scheduleImportJob: (...args) => {
		calls.schedules.push(args);
		return control.admissionError || { queued: true };
	} },
	'./startRequestOptions.js': { startRequestOptions: () => ({
		body: {}, dryRun: false, heichelId: 'fixture', jobAliasId: 'bot',
		jobAliasName: 'Fixture', skipLiveCheck: false, timeBudgetMs: 60000
	}) },
	'./startOwnership.js': { validateStartOwnership: async (...args) => {
		calls.ownerships.push(args);
		return control.ownershipError;
	} },
	'./startValidation.js': {
		logAgentOperation() {},
		validateStartIdentities: () => control.identityError
	}
};
for (const [moduleName, exported] of Object.entries(replacements)) {
	const resolved = require.resolve(moduleName);
	require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports: exported };
}
const { start } = require('./startMixin.js');

function makeRoute(authentication) {
	const route = {
		$i: { body: {} },
		checkAuthDetailed: () => authentication,
		runJob: () => { throw new Error('real runner must not execute'); }
	};
	route.start = start;
	return route;
}

function reset() {
	calls.schedules.length = 0;
	calls.ownerships.length = 0;
	control.methodError = null;
	control.identityError = null;
	control.ownershipError = null;
	control.admissionError = null;
}

test('authenticated start schedules exactly one validated job', async () => {
	reset();
	const route = makeRoute({ caller: { isAdmin: true } });
	const result = await route.start();
	assert.equal(result.success.jobId, 'isolated-start-id');
	assert.equal(result.success.status, 'queued');
	assert.equal(result.success.totalPosts, 1);
	assert.equal(calls.ownerships.length, 1);
	assert.equal(calls.schedules.length, 1);
	assert.strictEqual(calls.schedules[0][0], route.$i);
	assert.equal(calls.schedules[0][1].spec.heichelId, 'fixture');
	assert.equal(typeof calls.schedules[0][2], 'function');
});

for (const [label, configure] of [
	['wrong method', () => { control.methodError = { error: 'POST_REQUIRED' }; }],
	['invalid identity', () => { control.identityError = { error: 'INVALID_ID' }; }],
	['ownership denial', () => { control.ownershipError = { error: 'FORBIDDEN' }; }]
]) {
	test(`${label} cannot schedule an import`, async () => {
		reset();
		configure();
		const result = await makeRoute({ caller: {} }).start();
		assert.ok(result.error);
		assert.equal(calls.schedules.length, 0);
	});
}

test('missing login cannot schedule an import', async () => {
	reset();
	const result = await makeRoute({ authError: { error: 'NO_LOGIN' } }).start();
	assert.equal(result.error, 'NO_LOGIN');
	assert.equal(calls.schedules.length, 0);
});

test('failed persistent admission returns error rather than false success', async () => {
	reset();
	control.admissionError = { error: 'IMPORT_PERSIST_FAILED', message: 'Cannot persist job' };
	const result = await makeRoute({ caller: { isAdmin: true } }).start();
	assert.equal(result.error, 'IMPORT_PERSIST_FAILED');
	assert.equal(result.message, 'Cannot persist job');
	assert.equal(result.success, undefined);
	assert.equal(calls.schedules.length, 1);
});
