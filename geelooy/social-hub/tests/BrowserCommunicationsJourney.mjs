//B"H
//Boruch Hashem
//Blessed is He

import { waitFor } from './BrowserWait.mjs';

/**
 * @module BrowserCommunicationsJourney
 * @description
 * The Awtsmoos is beyond phone geometry, private word, reply source, and Hebrew direction, while Awtsmoos.com lets this Chrome journey press the actual Social communications vessels until semantic and spatial truth agree;
 * list, room, quote, audio, contextual send, RTL, Back, and dock clearance become measured evidence in light.
 */

export async function openMessages(client) {
	await client.evaluate(`location.hash = 'messages'`);
	await waitFor(
		client,
		`window.AwtsmoosSocialHub?.state.snapshot().activeTab === 'messages' && Boolean(document.querySelector('.hubMessageOpen'))`,
		'Messages route did not render the fixture conversation'
	);
	return client.evaluate(`(() => ({
		route: window.AwtsmoosSocialHub.state.snapshot().activeTab,
		conversation: document.querySelector('.hubMessageCard__title')?.textContent,
		unread: document.querySelector('.hubMessageUnread')?.textContent,
		request: document.querySelector('.hubRequestCard__state')?.textContent,
		overflow: document.documentElement.scrollWidth - innerWidth
	}))()`);
}

export async function openFixtureRoom(client) {
	await client.evaluate(`document.querySelector('.hubMessageOpen').click()`);
	await waitFor(
		client,
		`Boolean(document.querySelector('.hubConversationSurface:not([hidden]) [data-message-id="message-four"]'))`,
		'Fixture private room did not render canonical messages'
	);
	return roomSnapshot(client);
}

export async function selectAndSendReply(client) {
	await client.evaluate(`document.querySelector('[data-message-id="message-one"] [data-message-reply="true"]').click()`);
	await waitFor(
		client,
		`document.querySelector('.hubConversationReplyComposer')?.hidden === false`,
		'Reply composer did not reveal selected source'
	);
	const selected = await client.evaluate(`(() => ({
		speaker: document.querySelector('[data-reply-speaker]')?.textContent,
		preview: document.querySelector('[data-reply-preview]')?.textContent
	}))()`);
	await client.evaluate(`(() => {
		const input = document.querySelector('.hubConversationComposer--rich textarea');
		input.value = 'תגובה בעברית אל המקור';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		document.querySelector('.hubConversationComposer--rich').requestSubmit();
	})()`);
	await waitFor(
		client,
		`window.__awtsmoosPrivateMessagingFixture.bridge.store.messages.get('room-torah')?.length === 5`,
		'Contextual Social reply did not reach fixture protocol'
	);
	const sent = await client.evaluate(`(() => {
		const messages = window.__awtsmoosPrivateMessagingFixture.bridge.store.messages.get('room-torah');
		const last = messages.at(-1);
		const card = document.querySelector('[data-message-id="' + last.id + '"]');
		const body = card?.querySelector('.hubConversationMessage__body');
		return {
			text: last.text,
			replyTo: last.replyTo,
			replyText: last.reply?.text,
			directionAttribute: body?.getAttribute('dir'),
			computedDirection: body ? getComputedStyle(body).direction : '',
			insideViewport: card ? card.getBoundingClientRect().right <= innerWidth + 0.5 : false
		};
	})()`);
	return { selected, sent };
}

export async function jumpToReplySource(client) {
	await client.evaluate(`(() => {
		const previews = [...document.querySelectorAll('[data-reply-jump="true"]')];
		previews.at(-1)?.click();
	})()`);
	await waitFor(
		client,
		`document.activeElement?.dataset.messageId === 'message-one'`,
		'Bounded reply preview did not focus its loaded source'
	);
	return client.evaluate(`document.activeElement?.dataset.messageId || ''`);
}

export async function backToMessageList(client) {
	await client.evaluate(`document.querySelector('.hubConversationBack').click()`);
	await waitFor(
		client,
		`document.querySelector('.hubMessagesListSurface')?.hidden === false`,
		'Back did not restore the Messages list'
	);
	return client.evaluate(`location.href`);
}

export async function roomSnapshot(client) {
	return client.evaluate(`(() => {
		const composer = document.querySelector('.hubConversationComposer--rich');
		const dock = document.getElementById('mobileNavigation');
		const composerRect = composer?.getBoundingClientRect();
		const dockRect = dock?.getBoundingClientRect();
		return {
			title: document.querySelector('.hubConversationHeader h3')?.textContent,
			messages: document.querySelectorAll('.hubConversationMessage').length,
			senders: [...document.querySelectorAll('.hubConversationMessage__header strong')].map(node => node.textContent),
			times: document.querySelectorAll('.hubConversationMessage__header time').length,
			replyPreview: document.querySelector('[data-message-id="message-three"] .hubConversationReplyPreview span')?.textContent,
			audio: Boolean(document.querySelector('[data-message-id="message-four"] audio[controls]')),
			overflow: document.documentElement.scrollWidth - innerWidth,
			dockOverlap: composerRect && dockRect ? Math.max(0, composerRect.bottom - dockRect.top) : 0,
			maxCardRight: Math.max(...[...document.querySelectorAll('.hubConversationMessage')].map(node => node.getBoundingClientRect().right))
		};
	})()`);
}
