//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { InboxReadCoordinator } from '../js/inbox/InboxReadCoordinator.js';

/**
 * @file inboxReadCoordinator.test.mjs
 * @description
 * The Awtsmoos is beyond saved read truth and refreshed unread count, while Awtsmoos.com lets this Gevurah witness prove one successful mutation is never falsely reported as failed because secondary summary refresh broke;
 * item/thread read state, retry language, and stale-request guards remain distinct finite currents of light.
 */

function probe({ overviewFails = false } = {}) {
	const calls = [];
	const view = {
		stateView: {
			ready() {
				calls.push(['ready']);
			},
			error(message, retry) {
				calls.push(['error', message, retry]);
			}
		}
	};
	const collection = {
		markItemRead(id) {
			calls.push(['mark-item', id]);
		},
		markCurrentThreadRead() {
			calls.push(['mark-thread']);
		},
		updateOverview(value) {
			calls.push(['overview', value]);
		}
	};
	const api = {
		communicationsApi: {
			async markItemRead(aliasId, itemId) {
				calls.push(['api-item', aliasId, itemId]);
			},
			async markThreadRead(aliasId, threadId) {
				calls.push(['api-thread', aliasId, threadId]);
			},
			async overview(aliasId) {
				calls.push(['api-overview', aliasId]);
				if (overviewFails) throw new Error('summary offline');
				return { inbox: { unread: 0 } };
			}
		}
	};
	return { calls, view, collection, api };
}

test('successful item read remains saved even when summary refresh fails', async () => {
	const vessel = probe({ overviewFails: true });
	const reads = new InboxReadCoordinator({
		api: vessel.api,
		view: vessel.view,
		collection: vessel.collection,
		aliasId: () => 'teacher',
		isCurrent: () => true
	});
	assert.equal(await reads.markItem({ id: 'item-one' }), true);
	assert.deepEqual(vessel.calls.slice(0, 3), [
		['api-item', 'teacher', 'item-one'],
		['mark-item', 'item-one'],
		['api-overview', 'teacher']
	]);
	assert.match(vessel.calls.at(-1)[1], /summary counts could not refresh/i);
});

test('stale thread response cannot repaint read state', async () => {
	const vessel = probe();
	const reads = new InboxReadCoordinator({
		api: vessel.api,
		view: vessel.view,
		collection: vessel.collection,
		aliasId: () => 'teacher',
		isCurrent: () => false
	});
	assert.equal(await reads.markThread('teacher', 'thread-one', 8), false);
	assert.equal(vessel.calls.some(call => call[0] === 'mark-thread'), false);
	assert.equal(vessel.calls.some(call => call[0] === 'api-overview'), false);
});

test('successful current thread read updates visible state and overview', async () => {
	const vessel = probe();
	const reads = new InboxReadCoordinator({
		api: vessel.api,
		view: vessel.view,
		collection: vessel.collection,
		aliasId: () => 'teacher',
		isCurrent: () => true
	});
	assert.equal(await reads.markThread('teacher', 'thread-one', 9), true);
	assert.equal(vessel.calls.some(call => call[0] === 'mark-thread'), true);
	assert.equal(vessel.calls.some(call => call[0] === 'overview'), true);
	assert.deepEqual(vessel.calls.at(-1), ['ready']);
});
