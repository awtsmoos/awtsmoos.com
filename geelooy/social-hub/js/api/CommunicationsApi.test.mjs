//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps Mail, Signals, bridge inbox, and thread read-state contracts distinct but reachable;
 * Awtsmoos.com tests the communication plaza so one unified Inbox never changes the canonical rivers beneath it.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { CommunicationsApi } from './CommunicationsApi.js';
import { routeById } from '../navigation/RouteModel.js';

function captureTransport(result = {}) {
	const calls = [];
	return {
		calls,
		transport: {
			request(url, options = {}) {
				calls.push({ url, options });
				return Promise.resolve(result);
			}
		}
	};
}

test('overview and Inbox URLs preserve encoded alias identity', async () => {
	const capture = captureTransport({});
	const api = new CommunicationsApi(capture.transport);
	await api.overview('yakov yosef');
	await api.inbox('yakov yosef', 75);
	assert.equal(capture.calls[0].url, '/api/social/communications/yakov%20yosef/overview');
	assert.equal(capture.calls[1].url, '/api/social/communications/yakov%20yosef/inbox?limit=75');
});

test('thread routes encode thread identity and keep explicit limits', async () => {
	const capture = captureTransport([]);
	const api = new CommunicationsApi(capture.transport);
	await api.thread('yakov', 'review/channel one', 150);
	assert.equal(
		capture.calls[0].url,
		'/api/social/communications/yakov/threads/review%2Fchannel%20one?limit=150'
	);
});

test('read mutations use POST without inventing new payload state', async () => {
	const capture = captureTransport({});
	const api = new CommunicationsApi(capture.transport);
	await api.markItemRead('yakov', 'item one');
	await api.markThreadRead('yakov', 'thread one');
	assert.deepEqual(capture.calls[0], {
		url: '/api/social/communications/yakov/inbox/item%20one/read',
		options: { method: 'POST', body: {} }
	});
	assert.deepEqual(capture.calls[1], {
		url: '/api/social/communications/yakov/threads/thread%20one/read',
		options: { method: 'POST', body: {} }
	});
});

test('Inbox is a first-class Social Hub route', () => {
	assert.equal(routeById('inbox').title, 'Communications Inbox');
});
