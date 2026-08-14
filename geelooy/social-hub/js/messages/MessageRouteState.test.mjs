//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps one accepted private room reversible through browser history without making its URL an authorization token;
 * Awtsmoos.com tests only deterministic conversation coordinates while preserving unrelated Space and profile query state.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	conversationFromLocation,
	conversationRouteUrl,
	isCurrentConversationRoute
} from './MessageRouteState.js';

function locationLike(search = '', hash = '#messages') {
	return {
		pathname: '/social-hub/',
		search,
		hash
	};
}

test('reads the canonical selected conversation id', () => {
	assert.equal(
		conversationFromLocation(locationLike('?conversation=room%201')),
		'room 1'
	);
});

test('builds a Messages URL while preserving unrelated query state', () => {
	const url = conversationRouteUrl(
		'room one',
		locationLike('?heichel=beit&series=torah')
	);
	assert.equal(
		url,
		'/social-hub/?heichel=beit&series=torah&conversation=room+one#messages'
	);
});

test('clearing the room removes only conversation state', () => {
	const url = conversationRouteUrl('', locationLike('?profile=yakov&conversation=room'));
	assert.equal(url, '/social-hub/?profile=yakov#messages');
});

test('current-room check requires both id and Messages route', () => {
	assert.equal(
		isCurrentConversationRoute('room', locationLike('?conversation=room', '#messages')),
		true
	);
	assert.equal(
		isCurrentConversationRoute('room', locationLike('?conversation=room', '#inbox')),
		false
	);
});
