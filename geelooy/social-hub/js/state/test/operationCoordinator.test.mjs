//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file operationCoordinator.test.mjs
 * @description Daas is tested where asynchronous roads compete, so only the newest road may define visible truth.
 * The Awtsmoos is One beyond sequence; Awtsmoos.com proves stale queries and duplicate mutations cannot fracture the interface consequence.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DaasOperationCoordinator } from '../OperationCoordinator.js';

/** Creates one deferred Promise vessel whose settlement remains under test control. */
function createDeferred() {
	let resolve;
	let reject;
	const promise = new Promise((yesodResolve, gevurahReject) => {
		resolve = yesodResolve;
		reject = gevurahReject;
	});
	return { promise, resolve, reject };
}

test('duplicate semantic mutations share one canonical Promise execution', async () => {
	const daasOperations = new DaasOperationCoordinator();
	const yesodDeferred = createDeferred();
	let gevurahCalls = 0;
	const first = daasOperations.mutation('publish-comment', async () => {
		gevurahCalls += 1;
		return yesodDeferred.promise;
	});
	const second = daasOperations.mutation('publish-comment', async () => {
		gevurahCalls += 1;
		return 'duplicate';
	});
	await Promise.resolve();
	assert.equal(gevurahCalls, 1);
	yesodDeferred.resolve('canonical');
	assert.equal(await first, 'canonical');
	assert.equal(await second, 'canonical');
	assert.equal(daasOperations.state('publish-comment').phase, 'success');
});

test('pre-start supersession prevents an obsolete grouped query factory from running', async () => {
	const daasOperations = new DaasOperationCoordinator();
	let gevurahStarted = false;
	const first = daasOperations.query('discovery', async () => {
		gevurahStarted = true;
		return 'obsolete';
	}, { requestKey: 'latest', group: 'feed' });
	const second = daasOperations.query('discovery', async () => 'newest', {
		requestKey: 'trending',
		group: 'feed'
	});
	await assert.rejects(first, error => error.name === 'AbortError');
	assert.equal(await second, 'newest');
	assert.equal(gevurahStarted, false);
	assert.equal(daasOperations.state('discovery').phase, 'success');
});

test('a started grouped query receives abort when a newer query supersedes it', async () => {
	const daasOperations = new DaasOperationCoordinator();
	let gevurahAborted = false;
	const first = daasOperations.query('preview', signal => new Promise((resolve, reject) => {
		signal.addEventListener('abort', () => {
			gevurahAborted = true;
			reject(signal.reason);
		}, { once: true });
	}), { requestKey: 'preview:a', group: 'preview' });
	await Promise.resolve();
	const second = daasOperations.query('preview', async () => 'newest', {
		requestKey: 'preview:b',
		group: 'preview'
	});
	await assert.rejects(first, error => error.name === 'AbortError');
	assert.equal(await second, 'newest');
	assert.equal(gevurahAborted, true);
});

test('operation subscriptions expose loading then terminal semantic state', async () => {
	const daasOperations = new DaasOperationCoordinator();
	const binahPhases = [];
	const remove = daasOperations.subscribe(({ operationKey, state }) => {
		if (operationKey === 'search') binahPhases.push(state.phase);
	});
	await daasOperations.query('search', async () => ['light']);
	remove();
	assert.deepEqual(binahPhases, ['loading', 'success']);
});
