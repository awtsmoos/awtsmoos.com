// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabSharedChatClient.js
 * @description Gives localhost multiplayer world chat with personal moderation and reports.
 * The Awtsmoos joins nearby tabs without pretending they possess server guild or private law;
 * Awtsmoos.com preserves identity, history, protection, evidence, census, and explicit closure.
 */

import {
	createLocalTabSharedChatApi,
	localTabChatAddress,
	localTabChatSpeaker
} from './LocalTabSharedChatApi.js';
import { localTabChannelName } from './LocalTabIdentity.js';

export class LocalTabSharedChatClient {
	constructor(realtime) {
		this.realtime = realtime;
		this.listeners = new Map();
		this.messages = [];
		this.blocked = new Set();
		this.muted = new Set();
		this.reports = [];
		this.receiveBound = event => this.receive(event.data);
		this.channel = new realtime.BroadcastChannelClass(
			`${localTabChannelName(realtime.worldState.worldId)}:chat`
		);
		this.channel.addEventListener('message', this.receiveBound);
		this.mmorpg = { community: createLocalTabSharedChatApi(this) };
	}

	census() {
		return Promise.resolve({
			payload: { connected: this.realtime.world?.players?.length || 1 }
		});
	}

	on(type, listener) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type).add(listener);
		return () => this.listeners.get(type)?.delete(listener);
	}

	sendChat(message, scope = 'world') {
		if (scope !== 'world') {
			return Promise.reject(new Error('Local-tab chat supports World only.'));
		}
		const payload = {
			from: localTabChatSpeaker(this.realtime),
			id: `${this.realtime.playerId}:${Date.now()}:${this.messages.length}`,
			message,
			scope: 'world',
			sentAt: Date.now()
		};
		this.channel.postMessage({ payload, type: 'chat.message' });
		this.receive({ payload, type: 'chat.message' });
		return Promise.resolve({ payload, type: 'chat.sent' });
	}

	history() {
		return Promise.resolve({ payload: { messages: this.visibleMessages() } });
	}

	moderate(action, targetPlayerId) {
		const target = localTabChatAddress(targetPlayerId);
		const values = action.endsWith('block') ? this.blocked : this.muted;
		if (action.startsWith('un')) values.delete(target);
		else values.add(target);
		return Promise.resolve({ payload: this.moderationSnapshot() });
	}

	report(targetPlayerId, reason, messageId = null) {
		const payload = {
			createdAt: Date.now(),
			id: `local-report-${this.reports.length + 1}`,
			messageId,
			reason,
			targetAddress: localTabChatAddress(targetPlayerId)
		};
		this.reports.push(payload);
		return Promise.resolve({ payload, type: 'chat.reported' });
	}

	moderationSnapshot() {
		return {
			blockedPlayerAddresses: [...this.blocked],
			moderator: false,
			mutedPlayerAddresses: [...this.muted]
		};
	}

	receive(envelope) {
		if (envelope?.type !== 'chat.message' || !envelope.payload) return;
		this.messages.push(envelope.payload);
		if (this.messages.length > 100) this.messages.shift();
		if (this.hidden(envelope.payload)) return;
		for (const listener of this.listeners.get('chat.message') || []) {
			listener(envelope.payload);
		}
	}

	visibleMessages() {
		return this.messages.filter(message => !this.hidden(message));
	}

	hidden(message) {
		const address = message.from?.address;
		return this.blocked.has(address) || this.muted.has(address);
	}

	destroy() {
		this.channel.removeEventListener?.('message', this.receiveBound);
		this.channel.close();
		this.listeners.clear();
	}
}
