// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabSharedChatClient.js
	* @description Gives localhost multiplayer ordered world chat and personal protection.
	* The Awtsmoos joins nearby tabs without pretending they possess server law;
	* Awtsmoos.com preserves identity, bounded history, evidence, and explicit closure.
	*/

import { LocalTabChatModeration } from './LocalTabChatModeration.js';
import { createLocalTabSharedChatApi, localTabChatSpeaker } from './LocalTabSharedChatApi.js';
import { localTabChannelName } from './LocalTabIdentity.js';

const MAX_HISTORY = 100;

export class LocalTabSharedChatClient {
	constructor(realtime) {
		this.realtime = realtime;
		this.now = realtime.now || (() => Date.now());
		this.listeners = new Map();
		this.messages = [];
		this.moderation = new LocalTabChatModeration(this.now);
		this.blocked = this.moderation.blocked;
		this.muted = this.moderation.muted;
		this.reports = this.moderation.reports;
		this.receiveBound = event => this.receive(event.data);
		this.channel = new realtime.BroadcastChannelClass(
			`${localTabChannelName(realtime.worldState.worldId)}:chat`
		);
		this.channel.addEventListener('message', this.receiveBound);
		this.mmorpg = { community: createLocalTabSharedChatApi(this) };
		this.sentSequence = 0;
	}

	census() {
		return Promise.resolve({
			payload: { connected: this.realtime.world?.players?.length || 1 }
		});
	}

	on(type, listener) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type).add(listener);
		return () => this.listeners.get(type)?.delete(listener);
	}

	sendChat(message, scope = 'world') {
		if (scope !== 'world') {
			return Promise.reject(new Error('Local-tab chat supports World only.'));
		}
		const text = String(message || '').trim();
		if (!text) {
			return Promise.reject(new Error('A chat message is required.'));
		}
		this.sentSequence += 1;
		const payload = {
			from: localTabChatSpeaker(this.realtime),
			id: `${this.realtime.connectionId}:${this.sentSequence}`,
			message: text,
			scope: 'world',
			sentAt: this.now()
		};
		const envelope = { payload, type: 'chat.message' };
		this.channel.postMessage(envelope);
		this.receive(envelope);
		return Promise.resolve({ payload, type: 'chat.sent' });
	}

	history() {
		return Promise.resolve({ payload: { messages: this.visibleMessages() } });
	}

	moderate(action, targetPlayerId) {
		return Promise.resolve({ payload: this.moderation.moderate(action, targetPlayerId) });
	}

	report(targetPlayerId, reason, messageId = null) {
		const payload = this.moderation.report(targetPlayerId, reason, messageId);
		return Promise.resolve({ payload, type: 'chat.reported' });
	}

	moderationSnapshot() {
		return this.moderation.snapshot();
	}

	receive(envelope) {
		if (envelope?.type !== 'chat.message') {
			return;
		}
		const message = this.moderation.acceptMessage(envelope.payload);
		if (!message) {
			return;
		}
		this.messages.push(message);
		if (this.messages.length > MAX_HISTORY) {
			this.messages.shift();
		}
		if (this.moderation.hidden(message)) {
			return;
		}
		for (const listener of this.listeners.get('chat.message') || []) {
			listener(message);
		}
	}

	visibleMessages() {
		return this.messages.filter(message => !this.moderation.hidden(message));
	}

	destroy() {
		this.channel?.removeEventListener?.('message', this.receiveBound);
		this.channel?.close?.();
		this.channel = null;
		this.listeners.clear();
	}
}
