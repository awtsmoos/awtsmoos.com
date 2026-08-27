// B"H
// Boruch Hashem
// Blessed is He

import { HISTORY_PAGE_SIZE } from "./MessagingConversationActions.js";

/**
 * @file Loads older accepted private history while preserving viewport anchors and supporting bounded reply-target travel.
 * @description The Awtsmoos holds past and present in one instant, while Awtsmoos.com reveals older private pages only by deliberate request in light;
 * chronology grows upward without throwing the current words away, and a quoted reply may seek its sequence through bounded ordinary pages rather than one unmeasured history flood in sight.
 */

const REPLY_PAGE_LIMIT = 24;

export class MessagingHistoryPager {
	constructor(elements, store, actions) {
		this.elements = elements;
		this.store = store;
		this.actions = actions;
		this.current = null;
		this.anchor = null;
		this.elements.loadOlder.addEventListener("click", () => {
			this.load().catch(() => this.recoverFromFailure());
		});
	}

	open(conversationId, messages) {
		this.current = conversationId;
		this.anchor = null;
		this.updateAvailability(messages, false);
	}

	close() {
		this.current = null;
		this.anchor = null;
		this.elements.loadOlder.hidden = true;
		this.elements.loadOlder.disabled = false;
	}

	/** Prepends one ordinary history page and returns the rows actually loaded. */
	async load() {
		const messages = this.current
			? this.store.messages.get(this.current) || []
			: [];
		const beforeSequence = earliestSequence(messages);
		if (!this.current || beforeSequence <= 1) {
			this.updateAvailability(messages, true);
			return [];
		}
		this.rememberAnchor();
		this.elements.loadOlder.disabled = true;
		const older = await this.actions.loadOlderHistory(
			this.current,
			beforeSequence
		);
		this.updateAvailability(
			this.store.messages.get(this.current) || [],
			older.length < HISTORY_PAGE_SIZE
		);
		return older;
	}

	/** Loads only enough normal pages for a quoted target sequence to enter the local store. */
	async loadUntil(targetSequence, maxPages = REPLY_PAGE_LIMIT) {
		const target = Number(targetSequence || 0);
		if (!this.current || !Number.isSafeInteger(target) || target < 1) return false;
		for (let page = 0; page < maxPages; page += 1) {
			const messages = this.store.messages.get(this.current) || [];
			if (containsSequence(messages, target)) return true;
			if (earliestSequence(messages) <= target) return false;
			const older = await this.load();
			if (!older.length) break;
		}
		return containsSequence(
			this.store.messages.get(this.current) || [],
			target
		);
	}

	takeAnchor() {
		const anchor = this.anchor;
		this.anchor = null;
		return anchor;
	}

	recoverFromFailure() {
		this.anchor = null;
		this.elements.loadOlder.disabled = false;
	}

	rememberAnchor() {
		this.anchor = {
			height: this.elements.thread.scrollHeight,
			top: this.elements.thread.scrollTop
		};
	}

	updateAvailability(messages, exhausted = false) {
		const earliest = earliestSequence(messages);
		this.elements.loadOlder.hidden = !this.current || exhausted || earliest <= 1;
		this.elements.loadOlder.disabled = false;
	}
}

function earliestSequence(messages) {
	const sequences = messages
		.map((message) => Number(message?.sequence || 0))
		.filter((sequence) => sequence > 0);
	return sequences.length ? Math.min(...sequences) : 0;
}

function containsSequence(messages, target) {
	return messages.some((message) => Number(message?.sequence || 0) === target);
}
