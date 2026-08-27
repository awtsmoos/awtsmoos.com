//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { InboxCollectionState } from '../js/inbox/InboxCollectionState.js';

/**
 * @file inboxCollectionState.test.mjs
 * @description
 * The Awtsmoos is beyond cached overview and visible thread, while Awtsmoos.com lets this Yesod witness prove the last successful Inbox truth survives future refresh and navigation motion;
 * read state must propagate through cached and current collections without creating a second communication store in light.
 */

function viewProbe() {
	return {
		summaries: [],
		renders: [],
		summary(value) {
			this.summaries.push(value);
		},
		items(items, onOpen, onRead) {
			this.renders.push({
				items: structuredClone(items),
				onOpen,
				onRead
			});
		}
	};
}

test('successful overview becomes cached restoration truth', () => {
	const view = viewProbe();
	const state = new InboxCollectionState(view);
	const handlers = {
		onOpen() {},
		onRead() {}
	};
	state.bind(handlers);
	state.storeOverview(
		{ inbox: { unread: 2 } },
		[{ id: 'item-one', title: 'First' }]
	);
	state.renderItems([{ id: 'thread-one', title: 'Thread' }]);
	state.renderOverview();
	assert.deepEqual(view.summaries.at(-1), { inbox: { unread: 2 } });
	assert.deepEqual(view.renders.at(-1).items, [
		{ id: 'item-one', title: 'First' }
	]);
	assert.equal(view.renders.at(-1).onOpen, handlers.onOpen);
});

test('marking a cached item read survives thread travel and overview return', () => {
	const view = viewProbe();
	const state = new InboxCollectionState(view);
	state.bind({ onOpen() {}, onRead() {} });
	state.storeOverview({}, [
		{ id: 'item-one', readAt: null },
		{ id: 'item-two', readAt: 'already-read' }
	]);
	state.markItemRead('item-one');
	state.renderItems([{ id: 'thread-record', readAt: null }]);
	state.renderOverview();
	const restored = view.renders.at(-1).items;
	assert.equal(Boolean(restored[0].readAt), true);
	assert.equal(restored[1].readAt, 'already-read');
});

test('marking current thread read does not rewrite the cached overview collection', () => {
	const view = viewProbe();
	const state = new InboxCollectionState(view);
	state.bind({ onOpen() {}, onRead() {} });
	state.storeOverview({}, [{ id: 'overview-item', readAt: null }]);
	state.renderItems([{ id: 'thread-item', readAt: null }]);
	state.markCurrentThreadRead();
	assert.equal(Boolean(view.renders.at(-1).items[0].readAt), true);
	state.renderOverview();
	assert.equal(view.renders.at(-1).items[0].readAt, null);
});
