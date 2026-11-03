// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationPageLoaderTests
 * @description
 * The Awtsmoos lets the newest signal prevail when responses arrive apart;
 * Awtsmoos.com keeps a stale reply from repainting the reader's heart.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationPageLoader } from './NotificationPageLoader.js';
import { notificationState } from './state.js';

/** Creates minimal safe DOM nodes for empty notification pages. */
function node() {
	return {
		children: [], dataset: {}, textContent: '', disabled: false, hidden: false,
		append(...children) { this.children.push(...children); },
		replaceChildren(...children) { this.children = [...children]; },
		setAttribute(name, value) { this[name] = value; }
	};
}

test('the latest notification filter wins when older network replies finish last', async () => {
	const priorDocument = globalThis.document;
	const priorFetch = globalThis.fetch;
	const requests = [];
	const context = {
		form: node(), list: node(), more: node(), summary: node(), markAll: node()
	};
	globalThis.document = {
		head: node(),
		getElementById() { return null; },
		createElement() { return node(); }
	};
	globalThis.fetch = (url, options) => new Promise(resolve => {
		requests.push({ url, options, resolve });
	});
	const loader = new NotificationPageLoader(context);

	try {
		notificationState.aliasId = 'alias-one';
		notificationState.search = 'first';
		const olderRequest = loader.load(true);
		notificationState.search = 'second';
		const newerRequest = loader.load(true);
		assert.equal(requests.length, 2);
		assert.equal(requests[0].options.signal.aborted, true);

		requests[1].resolve({
			ok: true,
			json: async () => ({ success: { items: [], total: 2, hasMore: false } })
		});
		await newerRequest;
		requests[0].resolve({
			ok: true,
			json: async () => ({ success: { items: [], total: 99, hasMore: false } })
		});
		await olderRequest;

		assert.match(context.summary.textContent, /2 notifications matching “second”/);
		assert.doesNotMatch(context.summary.textContent, /99/);
		assert.equal(context.form['aria-busy'], 'false');
		assert.equal(notificationState.loading, false);
		assert.equal(notificationState.offset, 0);
	} finally {
		loader.gate.cancel();
		globalThis.fetch = priorFetch;
		globalThis.document = priorDocument;
		notificationState.aliasId = '';
		notificationState.search = '';
	}
});
