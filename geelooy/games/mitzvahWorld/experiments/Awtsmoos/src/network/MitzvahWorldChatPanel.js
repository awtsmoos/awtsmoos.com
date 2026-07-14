// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChatPanel.js
 * @description Presents live census, scoped history, channels, and private messaging.
 * The Awtsmoos renews each shared word within its rightful boundary; Awtsmoos.com
 * renders text through DOM text nodes and removes every listener when the world closes.
 */

import { installMitzvahWorldChatPanelStyle } from './MitzvahWorldChatPanelStyle.js';

export class MitzvahWorldChatPanel {
	constructor(client, options = {}) {
		installMitzvahWorldChatPanelStyle();
		this.client = client;
		this.intervalMs = options.intervalMs || 15000;
		this.messages = [];
		this.unsubscribers = [];
		this.root = createPanel();
		document.body.appendChild(this.root);
		this.bind();
		this.refreshHistory();
		this.refreshCensus();
		this.timer = setInterval(() => this.refreshCensus(), this.intervalMs);
	}

	get scope() {
		return this.root.querySelector('[data-chat-scope]').value;
	}

	get target() {
		return this.root.querySelector('[data-chat-target]').value.trim();
	}

	bind() {
		this.root.querySelector('[data-chat-toggle]').addEventListener('click', () => {
			const open = this.root.dataset.open !== 'true';
			this.root.dataset.open = String(open);
		});
		this.root.querySelector('[data-chat-scope]').addEventListener('change', () => {
			this.updateTargetVisibility();
			this.refreshHistory();
		});
		this.root.querySelector('[data-chat-send]').addEventListener('click', () => this.send());
		this.root.querySelector('[data-chat-message]').addEventListener('keydown', event => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				this.send();
			}
		});
		this.unsubscribers.push(this.client.on('chat.message', payload => this.receive(payload)));
		this.unsubscribers.push(this.client.on('chat.private', payload => this.receive(payload)));
		this.updateTargetVisibility();
	}

	async send() {
		const input = this.root.querySelector('[data-chat-message]');
		const message = input.value.trim();
		if (!message) return;
		this.setStatus('Sending…');
		try {
			await this.client.mmorpg.community.chat(this.scope, message, this.target || null);
			input.value = '';
			this.setStatus('Sent.');
		} catch (error) {
			this.setStatus(error.message);
		}
	}

	async refreshHistory() {
		this.setStatus('Loading history…');
		try {
			const response = await this.client.mmorpg.community.chatHistory(
				this.scope,
				this.target || null
			);
			this.messages = [...(response.payload.messages || [])];
			this.renderMessages();
			this.setStatus('');
		} catch (error) {
			this.messages = [];
			this.renderMessages();
			this.setStatus(error.message);
		}
	}

	async refreshCensus() {
		const output = this.root.querySelector('[data-chat-population]');
		try {
			const response = await this.client.census();
			output.textContent = `${response.payload.connected} connected`;
		} catch {
			output.textContent = 'Population unavailable';
		}
	}

	receive(payload) {
		this.messages.push(payload);
		if (this.messages.length > 100) this.messages.shift();
		this.renderMessages();
	}

	renderMessages() {
		const history = this.root.querySelector('[data-chat-history]');
		history.replaceChildren(...this.messages.map(messageLine));
		history.scrollTop = history.scrollHeight;
	}

	updateTargetVisibility() {
		this.root.querySelector('[data-chat-target-wrap]').dataset.visible = String(
			this.scope === 'private'
		);
	}

	setStatus(message) {
		this.root.querySelector('[data-chat-status]').textContent = message;
	}

	destroy() {
		clearInterval(this.timer);
		for (const unsubscribe of this.unsubscribers) unsubscribe?.();
		this.root.remove();
	}
}

function createPanel() {
	const root = document.createElement('section');
	root.className = 'Awtsmoos-chat';
	root.dataset.open = 'true';
	root.innerHTML = `<header><button class="Awtsmoos-chat-toggle" data-chat-toggle aria-label="Toggle chat">💬</button><strong>Community Chat</strong><output data-chat-population>Loading…</output></header><div class="Awtsmoos-chat-body"><div class="Awtsmoos-chat-controls"><select data-chat-scope aria-label="Chat channel"><option value="world">World</option><option value="global">Global</option><option value="party">Party</option><option value="guild">Guild</option><option value="private">Private</option></select><label class="Awtsmoos-chat-target" data-chat-target-wrap data-visible="false"><input data-chat-target placeholder="world:player-id" aria-label="Private player address"></label></div><div class="Awtsmoos-chat-history" data-chat-history aria-live="polite"></div><div class="Awtsmoos-chat-compose"><input data-chat-message maxlength="512" placeholder="Write a message…" aria-label="Message"><button class="Awtsmoos-chat-send" data-chat-send>Send</button></div><div class="Awtsmoos-chat-status" data-chat-status></div></div>`;
	return root;
}

function messageLine(message) {
	const line = document.createElement('p');
	line.className = 'Awtsmoos-chat-line';
	line.dataset.private = String(message.scope === 'private');
	const speaker = document.createElement('strong');
	speaker.textContent = `${message.from?.displayName || message.from?.address || 'World'}: `;
	line.append(speaker, document.createTextNode(message.message || ''));
	return line;
}
