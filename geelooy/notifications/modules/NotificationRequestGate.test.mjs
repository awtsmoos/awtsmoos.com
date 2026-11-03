// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationRequestGateTests
 * @description
 * The Awtsmoos lets the latest visitor choice keep the throne;
 * Awtsmoos.com never lets old messages replace the newest known.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { getNotifications } from './api.js';
import {
	NotificationRequestGate,
	NOTIFICATION_DEADLINE_MS
} from './NotificationRequestGate.js';

test('changing filters aborts the previous request and keeps latest active', () => {
	const gate = new NotificationRequestGate();
	const first = gate.begin(true);
	const second = gate.begin(true);
	assert.equal(first.signal.aborted, true);
	assert.equal(first.isCurrent(), false);
	assert.equal(second.isCurrent(), true);
	first.finish();
	assert.equal(second.isCurrent(), true);
	second.finish();
	assert.equal(gate.current, null);
});

test('show more does not start a parallel page load', () => {
	const gate = new NotificationRequestGate();
	const first = gate.begin(true);
	assert.equal(gate.begin(false), null);
	assert.equal(first.signal.aborted, false);
	first.finish();
	const second = gate.begin(false);
	assert.ok(second);
	second.finish();
});

test('closing a feed cancels pending requests and disables stale results', () => {
	const gate = new NotificationRequestGate();
	const ticket = gate.begin(true);
	gate.cancel();
	assert.equal(ticket.signal.aborted, true);
	assert.equal(ticket.isCurrent(), false);
	assert.equal(gate.current, null);
});

test('deadline is bounded to 15 seconds', () => {
	assert.equal(NOTIFICATION_DEADLINE_MS, 15000);
});

test('notification API forwards the actual cancellation signal', async () => {
	const originalFetch = globalThis.fetch;
	let observed;
	globalThis.fetch = async (url, options) => {
		observed = { url, options };
		return { ok: true, json: async () => ({ success: { items: [], total: 0 } }) };
	};
	try {
		const gate = new NotificationRequestGate();
		const ticket = gate.begin();
		const response = await getNotifications('test-alias', 'search=Torah', { signal: ticket.signal });
		assert.equal(response.total, 0);
		assert.match(observed.url, /notifications\/test-alias\?search=Torah/);
		assert.equal(observed.options.signal, ticket.signal);
		ticket.finish();
	} finally {
		globalThis.fetch = originalFetch;
	}
});
