//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConversationGatewayArchitectureContract
 * @description
 * The Awtsmoos is beyond inheritance, history, and watermark, yet every finite contract deserves proof in light;
 * Awtsmoos.com verifies that the simple room surface rests on shared transport, isolated store reconciliation, and the server's canonical wire shape right.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { YesodConversationHistorySynchronizer } from './ConversationHistorySynchronizer.js';

const MALCHUS_GATEWAY_SOURCE = readNearby('./ConversationGateway.js');
const YESOD_READ_SOURCE = readNearby('./ConversationReadGateway.js');
const GEVURAH_SERVER_READ_SOURCE = readNearby(
	'../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/conversationReadHandlers.js'
);

/**
 * Reads one source artifact relative to this contract without executing browser-only absolute imports.
 *
 * @param {string} netzachRelativePath - Relative path from this test module to the contract source.
 * @returns {string} UTF-8 source text used only for architecture/wire-contract assertions.
 */
function readNearby(netzachRelativePath) {
	return readFileSync(
		new URL(netzachRelativePath, import.meta.url),
		'utf8'
	);
}

/**
 * Creates one canonical-store test vessel whose writes remain visible as an ordered call ledger.
 *
 * @returns {{store: object, calls: Array<object>}} Shared-store double and mutation ledger.
 */
function createHistoryStoreVessel() {
	const hodCalls = [];
	return {
		calls: hodCalls,
		store: {
			setHistory(conversationId, messages) {
				hodCalls.push({ kind: 'set', conversationId, messages });
			},
			prependHistory(conversationId, messages) {
				hodCalls.push({ kind: 'prepend', conversationId, messages });
			}
		}
	};
}

test('history synchronizer preserves newest versus older store semantics', () => {
	const yesodVessel = createHistoryStoreVessel();
	const tiferesHistory = new YesodConversationHistorySynchronizer(yesodVessel.store);
	const malchusNewest = [{ sequence: 9 }];
	const malchusOlder = [{ sequence: 3 }];
	assert.deepEqual(
		tiferesHistory.reconcile('room', { payload: { messages: malchusNewest } }),
		malchusNewest
	);
	assert.deepEqual(
		tiferesHistory.reconcile('room', { payload: { messages: malchusOlder } }, 9),
		malchusOlder
	);
	assert.deepEqual(yesodVessel.calls, [
		{ kind: 'set', conversationId: 'room', messages: malchusNewest },
		{ kind: 'prepend', conversationId: 'room', messages: malchusOlder }
	]);
});

test('history synchronizer turns malformed or absent message collections into an empty canonical page', () => {
	const yesodVessel = createHistoryStoreVessel();
	const tiferesHistory = new YesodConversationHistorySynchronizer(yesodVessel.store);
	assert.deepEqual(tiferesHistory.reconcile('room', null), []);
	assert.deepEqual(yesodVessel.calls[0], {
		kind: 'set',
		conversationId: 'room',
		messages: []
	});
});

test('public gateway inherits the read capability instead of duplicating transport or history code', () => {
	assert.match(MALCHUS_GATEWAY_SOURCE, /extends YesodConversationReadGateway/);
	assert.match(YESOD_READ_SOURCE, /extends PrivateMessagingGateway/);
	assert.match(YESOD_READ_SOURCE, /YesodConversationHistorySynchronizer/);
	assert.doesNotMatch(MALCHUS_GATEWAY_SOURCE, /setHistory|prependHistory/);
	assert.doesNotMatch(YESOD_READ_SOURCE, /setHistory|prependHistory/);
});

test('client and server agree on the canonical READ sequence field', () => {
	assert.match(YESOD_READ_SOURCE, /sequence:\s*netzachSequence/);
	assert.match(GEVURAH_SERVER_READ_SOURCE, /payload\.sequence/);
	assert.match(YESOD_READ_SOURCE, /NETZACH_PAGE_SIZE\s*=\s*50/);
});
