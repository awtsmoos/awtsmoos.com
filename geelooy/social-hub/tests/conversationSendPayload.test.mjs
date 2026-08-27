//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildConversationSendPayload } from '../js/messages/ConversationSendPayload.js';

/**
 * @file conversationSendPayload.test.mjs
 * @description
 * The Awtsmoos is beyond wire and payload, while Awtsmoos.com lets this Gevurah witness prove Social private messaging contributes only canonical text, reply coordinates, and asset id;
 * legacy text remains unchanged, while richer reply and voice light cannot smuggle client-trusted media metadata into the server covenant.
 */

test('legacy text send preserves the exact narrow wire shape', () => {
	assert.deepEqual(
		buildConversationSendPayload('room-one', 'Shalom'),
		{
			conversationId: 'room-one',
			text: 'Shalom'
		}
	);
});

test('reply send adds only canonical id and numeric sequence', () => {
	assert.deepEqual(
		buildConversationSendPayload(
			'room-one',
			'Answer',
			{
				replyTo: 'message-seven',
				replySequence: '7',
				text: 'must not travel'
			}
		),
		{
			conversationId: 'room-one',
			text: 'Answer',
			replyTo: 'message-seven',
			replySequence: 7
		}
	);
});

test('voice send transmits only server-verifiable asset id', () => {
	assert.deepEqual(
		buildConversationSendPayload(
			'room-one',
			'',
			null,
			{
				assetId: 'asset-voice-one',
				mime: 'audio/fake',
				publicPath: '/client/forged.ogg',
				name: 'forged.ogg'
			}
		),
		{
			conversationId: 'room-one',
			text: '',
			attachment: {
				assetId: 'asset-voice-one'
			}
		}
	);
});

test('incomplete reply coordinates are omitted instead of partially trusted', () => {
	assert.deepEqual(
		buildConversationSendPayload(
			'room-one',
			'No partial quote',
			{
				replyTo: 'message-seven',
				replySequence: 0
			}
		),
		{
			conversationId: 'room-one',
			text: 'No partial quote'
		}
	);
});
