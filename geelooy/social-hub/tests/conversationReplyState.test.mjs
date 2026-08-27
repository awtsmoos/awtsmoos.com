//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { ConversationReplyState } from '../js/messages/ConversationReplyState.js';

/**
 * @file conversationReplyState.test.mjs
 * @description
 * The Awtsmoos is beyond source and response, while Awtsmoos.com lets this Yesod witness prove selected reply coordinates remain independent from editable draft state;
 * text and voice sources become bounded previews, cancellation erases only reply intent, and no missing canonical sequence is allowed to masquerade as light.
 */

function replyRegion() {
	const speaker = { textContent: '' };
	const preview = { textContent: '' };
	return {
		hidden: true,
		speaker,
		preview,
		querySelector(selector) {
			if (selector === '[data-reply-speaker]') return speaker;
			if (selector === '[data-reply-preview]') return preview;
			return null;
		}
	};
}

test('canonical text message becomes a stable reply payload and visible source strip', () => {
	const state = new ConversationReplyState({});
	const region = replyRegion();
	state.bind(region);
	assert.equal(state.select({
		id: 'message-seven',
		sequence: 7,
		alias: 'friend',
		text: 'Earlier Torah thought'
	}, 'teacher'), true);
	assert.deepEqual(state.payload(), {
		replyTo: 'message-seven',
		replySequence: 7
	});
	assert.equal(region.hidden, false);
	assert.equal(region.speaker.textContent, 'Replying to friend');
	assert.equal(region.preview.textContent, 'Earlier Torah thought');
});

test('voice-only source receives a truthful preview and own-speaker label', () => {
	const state = new ConversationReplyState({});
	const region = replyRegion();
	state.bind(region);
	state.select({
		id: 'voice-nine',
		sequence: 9,
		alias: 'teacher',
		attachment: { type: 'audio' }
	}, 'teacher');
	assert.equal(region.speaker.textContent, 'Replying to You');
	assert.equal(region.preview.textContent, 'Voice note');
});

test('clear removes reply intent without needing or mutating any draft object', () => {
	const state = new ConversationReplyState({});
	const region = replyRegion();
	state.bind(region);
	state.select({ id: 'm1', sequence: 1, alias: 'a', text: 'x' });
	state.clear();
	assert.equal(state.hasReply(), false);
	assert.equal(state.payload(), null);
	assert.equal(region.hidden, true);
});

test('message without a positive canonical sequence cannot become reply intent', () => {
	const state = new ConversationReplyState({});
	assert.equal(state.select({ id: 'm1', sequence: 0, text: 'x' }), false);
	assert.equal(state.payload(), null);
});
