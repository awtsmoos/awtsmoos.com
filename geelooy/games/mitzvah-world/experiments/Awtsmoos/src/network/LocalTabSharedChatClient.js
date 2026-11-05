// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file LocalTabSharedChatClient.js
	* @description Gives localhost multiplayer bounded world chat and personal protection.
	* The Awtsmoos joins nearby tabs without making one listener master of the channel;
	* Awtsmoos.com bounds speech before broadcast, guards evidence, and closes every ear.
	*/

import { LocalTabChatModeration } from './LocalTabChatModeration.js';
import { createLocalTabSharedChatApi } from './LocalTabSharedChatApi.js';
import { createLocalTabChatEnvelope, localTabChatClientError } from './LocalTabSharedChatDelivery.js';
import { localTabChannelName } from './LocalTabIdentity.js';
import { MitzvahWorldEventHub } from './MitzvahWorldEventHub.js';
const MAX_HISTORY = 100;

export class LocalTabSharedChatClient {
	constructor(realtime) {
		this.realtime = realtime;
		this.now = realtime.now || (() => Date.now());
		this.destroyed = false;
		this.events = new MitzvahWorldEventHub(realtime.onListenerError);
		this.messages = [];
		this.moderation = new LocalTabChatModeration(this.now);
		this.blocked = this.moderation.blocked;
		this.muted = this.moderation.muted;
		this.reports = this.moderation.reports;
		this.receiveBound = event => this.receive(event?.data);
		this.channel = new realtime.BroadcastChannelClass(
			`${localTabChannelName(realtime.worldState.worldId)}:chat`
		);
		this.channel.addEventListener('message', this.receiveBound);
		this.mmorpg = {
			community: createLocalTabSharedChatApi(this)
		};
		this.sentSequence = 0;
	}
	census() {
		return Promise.resolve({
			payload: {
				connected: this.realtime.world?.players?.length || 1
			}
		});
	}
	on(type, listener) {
		return this.events.on(type, listener);
	}
	sendChat(message, scope = 'world') {
		let envelope;
		try {
			envelope = createLocalTabChatEnvelope(this, message, scope);
		} catch (error) {
			return Promise.reject(error);
		}
		this.channel.postMessage(envelope);
		this.receive(envelope);
		return Promise.resolve({
			payload: envelope.payload,
			type: 'chat.sent'
		});
	}
	history() {
		return Promise.resolve({
			payload: { messages: this.visibleMessages() }
		});
	}
	moderate(action, targetPlayerId) {
		if (this.destroyed) return closedChatPromise();
		return Promise.resolve({
			payload: this.moderation.moderate(action, targetPlayerId)
		});
	}
	report(targetPlayerId, reason, messageId = null) {
		if (this.destroyed) return closedChatPromise();
		const payload = this.moderation.report(
			targetPlayerId,
			reason,
			messageId
		);
		return Promise.resolve({ payload, type: 'chat.reported' });
	}
	moderationSnapshot() {
		return this.moderation.snapshot();
	}
	receive(envelope) {
		if (this.destroyed || envelope?.type !== 'chat.message') return false;
		const message = this.moderation.acceptMessage(envelope.payload);
		if (!message) return false;
		this.messages.push(message);
		if (this.messages.length > MAX_HISTORY) this.messages.shift();
		if (!this.moderation.hidden(message)) {
			this.events.emit({ payload: message, type: 'chat.message' });
		}
		return true;
	}
	visibleMessages() {
		return this.messages.filter(
			message => !this.moderation.hidden(message)
		);
	}
	destroy() {
		if (this.destroyed) return false;
		this.destroyed = true;
		this.channel?.removeEventListener?.('message', this.receiveBound);
		this.channel?.close?.();
		this.channel = null;
		this.events.destroy();
		return true;
	}
}

function closedChatPromise() {
	return Promise.reject(localTabChatClientError(
		'CHAT_CLIENT_CLOSED',
		'Chat is closed.'
	));
}
