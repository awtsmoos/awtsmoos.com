// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabChatModeration.js
	* @description Canonicalizes local speakers and applies bounded personal moderation.
	* The Awtsmoos protects speech without confusing a name with its address;
	* Awtsmoos.com makes block, mute, report, and dedupe one measured lattice.
	*/

import { localTabPlayerAddress } from './LocalTabIdentity.js';

const MAX_CHAT_LENGTH = 280;
const MAX_REASON_LENGTH = 240;
const MAX_SEEN_MESSAGES = 500;

export class LocalTabChatModeration {
	constructor(now = () => Date.now()) {
		this.now = now;
		this.blocked = new Set();
		this.muted = new Set();
		this.reports = [];
		this.seen = new Set();
	}

	acceptMessage(value) {
		const message = normalizeLocalTabChatMessage(value);
		if (!message || this.seen.has(message.id)) {
			return null;
		}
		this.seen.add(message.id);
		if (this.seen.size > MAX_SEEN_MESSAGES) {
			this.seen.delete(this.seen.values().next().value);
		}
		return message;
	}

	moderate(action, targetValue) {
		const target = canonicalLocalTabChatAddress(targetValue);
		const values = String(action).includes('block') ? this.blocked : this.muted;
		if (String(action).startsWith('un')) {
			values.delete(target);
		} else {
			values.add(target);
		}
		return this.snapshot();
	}

	report(targetValue, reason, messageId = null) {
		const report = {
			createdAt: this.now(),
			id: `local-report-${this.reports.length + 1}`,
			messageId: messageId || null,
			reason: String(reason || '').trim().slice(0, MAX_REASON_LENGTH),
			targetAddress: canonicalLocalTabChatAddress(targetValue)
		};
		this.reports.push(report);
		return report;
	}

	hidden(message) {
		const address = canonicalLocalTabChatAddress(message?.from?.address || message?.from?.id);
		return this.blocked.has(address) || this.muted.has(address);
	}

	snapshot() {
		return {
			blockedPlayerAddresses: [...this.blocked],
			moderator: false,
			mutedPlayerAddresses: [...this.muted]
		};
	}
}

export function canonicalLocalTabChatAddress(value) {
	const text = String(value || '').trim();
	if (text.startsWith('local-tab://')) {
		return text;
	}
	if (text.startsWith('local:')) {
		return localTabPlayerAddress(text.slice('local:'.length));
	}
	if (text.includes('://')) {
		return text;
	}
	return localTabPlayerAddress(text);
}

export function normalizeLocalTabChatMessage(value) {
	const text = String(value?.message || '').trim().slice(0, MAX_CHAT_LENGTH);
	if (!value?.id || !text || value.scope !== 'world') {
		return null;
	}
	const from = {
		...value.from,
		address: canonicalLocalTabChatAddress(value.from?.address || value.from?.id)
	};
	return {
		...value,
		from,
		message: text,
		sentAt: Number.isFinite(Number(value.sentAt)) ? Number(value.sentAt) : Date.now()
	};
}
