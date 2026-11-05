// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file LocalTabChatModeration.js
	* @description Applies finite personal moderation evidence to canonical local speakers.
	* The Awtsmoos protects speech without turning an unknown verb into hidden law;
	* Awtsmoos.com matches canonical truth while public receipts retain their familiar garment.
	*/

import {
	boundedChatText,
	canonicalLocalTabChatAddress,
	finiteChatTimestamp,
	localTabChatValueError,
	MAX_LOCAL_TAB_CHAT_LENGTH,
	normalizeLocalTabChatMessage,
	normalizeLocalTabChatText,
	publicLocalTabChatAddress
} from './LocalTabChatValues.js';

const MAX_REASON_LENGTH = 240;
const MAX_REPORTS = 100;
const MAX_SEEN_MESSAGES = 500;
const MODERATION_ACTIONS = new Set([
	'block',
	'unblock',
	'mute',
	'unmute'
]);

export class LocalTabChatModeration {
	constructor(now = () => Date.now()) {
		this.now = now;
		this.blocked = new Set();
		this.muted = new Set();
		this.reports = [];
		this.reportSerial = 0;
		this.seen = new Set();
	}
	acceptMessage(value) {
		const message = normalizeLocalTabChatMessage(value, this.now);
		if (!message || this.seen.has(message.id)) return null;
		this.seen.add(message.id);
		if (this.seen.size > MAX_SEEN_MESSAGES) {
			this.seen.delete(this.seen.values().next().value);
		}
		return message;
	}
	moderate(actionValue, targetValue) {
		const action = String(actionValue || '').trim().toLowerCase();
		if (!MODERATION_ACTIONS.has(action)) {
			throw localTabChatValueError(
				'INVALID_MODERATION_ACTION',
				'Unknown moderation action.'
			);
		}
		const target = canonicalLocalTabChatAddress(targetValue);
		const values = action.includes('block') ? this.blocked : this.muted;
		action.startsWith('un') ? values.delete(target) : values.add(target);
		return this.snapshot();
	}
	report(targetValue, reasonValue, messageId = null) {
		const reason = boundedChatText(reasonValue, MAX_REASON_LENGTH);
		if (!reason) {
			throw localTabChatValueError(
				'REPORT_REASON_REQUIRED',
				'A report reason is required.'
			);
		}
		this.reportSerial += 1;
		const report = {
			createdAt: finiteChatTimestamp(this.now()),
			id: `local-report-${this.reportSerial}`,
			messageId: messageId
				? boundedChatText(messageId, 160)
				: null,
			reason,
			targetAddress: publicLocalTabChatAddress(targetValue)
		};
		this.reports.push(report);
		if (this.reports.length > MAX_REPORTS) this.reports.shift();
		return { ...report };
	}
	hidden(message) {
		let address;
		try {
			address = canonicalLocalTabChatAddress(
				message?.from?.address || message?.from?.id
			);
		} catch {
			return false;
		}
		return this.blocked.has(address) || this.muted.has(address);
	}
	snapshot() {
		return {
			blockedPlayerAddresses: publicAddresses(this.blocked),
			moderator: false,
			mutedPlayerAddresses: publicAddresses(this.muted)
		};
	}
}

function publicAddresses(values) {
	return [...values].map(publicLocalTabChatAddress);
}

export {
	canonicalLocalTabChatAddress,
	MAX_LOCAL_TAB_CHAT_LENGTH,
	normalizeLocalTabChatMessage,
	normalizeLocalTabChatText,
	publicLocalTabChatAddress
} from './LocalTabChatValues.js';
