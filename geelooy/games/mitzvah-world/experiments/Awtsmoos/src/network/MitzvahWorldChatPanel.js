// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatPanel.js
	* @description Presents retractable shared chat with personal protection outside solo and boot.
	* The Awtsmoos opens conversation only by choice; Awtsmoos.com keeps folding, moderation,
	* transport truth, text safety, bounded polling, private history, and teardown complete.
	*/

import {
	loadChatPanelChannels,
	refreshChatPanelCensus,
	refreshChatPanelHistory
} from './MitzvahWorldChatPanelData.js';
import {
	bindMitzvahWorldChatPanel
} from './MitzvahWorldChatPanelBindings.js';
import {
	bindChatModerationControls
} from './MitzvahWorldChatModerationControls.js';
import { installMitzvahWorldChatPanelStyle } from './MitzvahWorldChatPanelStyle.js';
import { readChatPanelOpen, writeChatPanelOpen } from './MitzvahWorldChatPanelState.js';
import {
	createChatMessageLine,
	createMitzvahWorldChatPanel
} from './MitzvahWorldChatPanelView.js';

export class MitzvahWorldChatPanel {
	constructor(client, options = {}) {
		this.client = client;
		this.environment = options.environment || globalThis;
		this.documentValue = options.documentValue || this.environment.document;
		this.storage = options.storage || this.environment.localStorage;
		this.intervalMs = options.intervalMs || 15000;
		this.messages = [];
		this.timer = null;
		const open = readChatPanelOpen(this.storage);
		installMitzvahWorldChatPanelStyle(this.documentValue);
		this.root = createMitzvahWorldChatPanel(this.documentValue, open);
		(options.root || this.documentValue.body).appendChild(this.root);
		this.moderation = bindChatModerationControls(this);
		this.unbind = bindMitzvahWorldChatPanel(this);
		if (open) this.activate();
	}

	get scope() {
		return this.root.querySelector('[data-chat-scope]').value || 'world';
	}

	get target() {
		return this.root.querySelector('[data-chat-target]').value.trim();
	}

	setOpen(open) {
		this.root.dataset.open = String(open);
		this.root.querySelector('[data-chat-toggle]').setAttribute('aria-expanded', String(open));
		writeChatPanelOpen(this.storage, open);
		open ? this.activate() : this.stopPolling();
	}

	async activate() {
		await loadChatPanelChannels(this);
		this.updateTargetVisibility();
		await Promise.all([
			this.refreshHistory(),
			refreshChatPanelCensus(this),
			this.moderation.refresh()
		]);
		this.stopPolling();
		this.timer = this.environment.setInterval?.(
			() => refreshChatPanelCensus(this),
			this.intervalMs
		) || null;
		this.timer?.unref?.();
	}

	refreshHistory() {
		return refreshChatPanelHistory(this);
	}

	receive(payload) {
		this.messages.push(payload);
		if (this.messages.length > 100) this.messages.shift();
		this.renderMessages();
	}

	renderMessages() {
		const history = this.root.querySelector('[data-chat-history]');
		history.replaceChildren(...this.messages.map(message => {
			return createChatMessageLine(this.documentValue, message);
		}));
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

	stopPolling() {
		if (this.timer !== null) this.environment.clearInterval?.(this.timer);
		this.timer = null;
	}

	destroy() {
		this.stopPolling();
		this.moderation.destroy();
		this.unbind();
		this.root.remove();
	}
}
