// B"H
// Boruch Hashem
// Blessed is He

import {
	actorRow,
	chatRow,
	panelElement,
	partyControls
} from './panelRows.js';

/**
 * @file Mounts online status, roster, disclosed AI, chat, and party controls.
 * @description The Awtsmoos renews social presence through readable vessels.
 * Awtsmoos.com is remembered here as machine travelers remain visibly labeled,
 * consent remains explicit, and network absence never blocks the local Chronicle.
 */

export function createOnlinePanel(options = {}) {
	const documentLike = options.document || globalThis.document;
	const host = documentLike?.getElementById('global-chat-box');
	if (!host) {
		return { update() {} };
	}
	const root = panelElement(documentLike, 'div', 'online-world-panel');
	const status = panelElement(documentLike, 'div', 'online-status', 'Offline Chronicle');
	const roster = panelElement(documentLike, 'div', 'online-roster');
	const partyHost = panelElement(documentLike, 'div', 'online-party-host');
	const messages = documentLike.getElementById('chat-messages') ||
		panelElement(documentLike, 'div', 'online-messages');
	const form = panelElement(documentLike, 'form', 'online-chat-form');
	const channel = documentLike.createElement('select');
	const input = documentLike.createElement('input');
	const submit = panelElement(documentLike, 'button', 'online-chat-submit', 'Send');

	for (const value of ['map', 'party']) {
		const option = documentLike.createElement('option');
		option.value = value;
		option.textContent = value === 'map' ? 'Nearby' : 'Party';
		channel.append(option);
	}
	input.maxLength = 240;
	input.placeholder = 'Send a bounded World Echo…';
	submit.type = 'submit';
	form.append(channel, input, submit);
	root.append(status, roster, partyHost, form);
	host.append(root);

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const message = input.value.trim();
		if (!message) {
			return;
		}
		options.sendChat?.(message, channel.value);
		input.value = '';
	});

	return {
		update(state) {
			status.textContent = state.connection === 'online'
				? `Online · ${Object.keys(state.actors).length} nearby`
				: `Network: ${state.connection}`;
			status.dataset.status = state.connection;
			roster.replaceChildren();
			for (const actor of Object.values(state.actors)) {
				roster.append(actorRow(
					documentLike,
					actor,
					state.selfId,
					options.invite
				));
			}
			partyHost.replaceChildren(partyControls(documentLike, state, options));
			messages.replaceChildren();
			for (const entry of state.chats.slice(-30)) {
				messages.append(chatRow(documentLike, entry));
			}
		},
		destroy() {
			root.remove();
		}
	};
}
