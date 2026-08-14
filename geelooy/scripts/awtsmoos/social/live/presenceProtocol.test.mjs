//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets ephemeral protocol remain measurable before it touches a socket;
 * Awtsmoos.com tests room messages and reconnect bounds so realtime return never becomes an accidental flood.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loginMessage,
	pageEnterMessage,
	pageLeaveMessage,
	pageReadingMessage,
	pageTypingMessage,
	parsePresenceMessage,
	reconnectDelay
} from './presenceProtocol.js';

test('builds canonical presence messages', () => {
	assert.deepEqual(loginMessage('yakov'), { type: 'LOGIN', aliasId: 'yakov' });
	assert.deepEqual(pageEnterMessage('yakov', 'page:/room'), {
		type: 'PAGE_ENTER',
		aliasId: 'yakov',
		channel: 'page:/room',
		status: 'viewing'
	});
	assert.deepEqual(pageLeaveMessage('yakov', 'page:/room'), {
		type: 'PAGE_LEAVE',
		aliasId: 'yakov',
		channel: 'page:/room'
	});
	assert.deepEqual(pageTypingMessage('yakov', 'page:/room', false), {
		type: 'PAGE_TYPING',
		aliasId: 'yakov',
		channel: 'page:/room',
		typing: false
	});
	assert.deepEqual(pageReadingMessage('yakov', 'page:/room', '/social-hub/#spaces'), {
		type: 'PAGE_READING',
		aliasId: 'yakov',
		channel: 'page:/room',
		reading: '/social-hub/#spaces'
	});
});

test('parses JSON and safely preserves non-JSON text', () => {
	assert.deepEqual(parsePresenceMessage('{"type":"PAGE_PRESENCE","count":2}'), {
		type: 'PAGE_PRESENCE',
		count: 2
	});
	assert.deepEqual(parsePresenceMessage('shalom'), {
		type: 'PAGE_TEXT',
		text: 'shalom'
	});
});

test('reconnect delay is jittered and bounded', () => {
	assert.equal(reconnectDelay(0, () => 0), 300);
	assert.equal(reconnectDelay(0, () => 1), 500);
	assert.equal(reconnectDelay(4, () => .5), 6400);
	assert.equal(reconnectDelay(99, () => 1), 12000);
});
