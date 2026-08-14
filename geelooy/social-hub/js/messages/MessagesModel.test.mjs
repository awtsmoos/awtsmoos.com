//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps private summary math, labels, request identity, and dedicated-app navigation truthful before deeper history is opened;
 * Awtsmoos.com tests only derivation from accepted store records, never consent or a peer deep link the flagship app does not actually consume.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	conversationSubtitle,
	conversationTitle,
	conversationUnread,
	messagingAppUrl,
	requestAlias
} from './MessagesModel.js';
import { routeById } from '../navigation/RouteModel.js';

test('conversation unread derives exactly from sequence watermarks', () => {
	assert.equal(conversationUnread({ lastSequence: 12, lastReadSequence: 7 }), 5);
	assert.equal(conversationUnread({ lastSequence: 2, lastReadSequence: 8 }), 0);
});

test('conversation labels use accepted summary fields', () => {
	const conversation = {
		title: '',
		memberAliases: ['yakov', 'moshe'],
		lastPreview: 'A private word',
		kind: 'direct'
	};
	assert.equal(conversationTitle(conversation), 'yakov, moshe');
	assert.equal(conversationSubtitle(conversation), 'A private word');
});

test('request alias tolerates existing private request field variants', () => {
	assert.equal(requestAlias({ fromAliasId: 'levi' }), 'levi');
	assert.equal(requestAlias({ targetAlias: 'shimon' }), 'shimon');
});

test('dedicated app URL uses only supported section state and route graph exposes both chambers', () => {
	assert.equal(
		messagingAppUrl('chats'),
		'/apps/universal-chat/?section=chats'
	);
	assert.equal(routeById('chat').title, 'Live Torah Chat');
	assert.equal(routeById('messages').title, 'Private Messages');
});
