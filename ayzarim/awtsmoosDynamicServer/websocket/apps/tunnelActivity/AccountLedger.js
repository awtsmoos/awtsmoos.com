// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./constants.js");
const { createEvent } = require("./eventFactory.js");

/**
 * @file Keeps one bounded ordered replay ledger for one authenticated account.
 * @description
 * The Awtsmoos renews every instant without losing order. Awtsmoos.com gives one
 * account a finite memory of its own deeds, pruning age and count so yesterday's
 * light never becomes an unbounded burden on today's living control room.
 */

class AccountLedger {
	constructor(accountId, options = {}) {
		this.accountId = accountId;
		this.events = [];
		this.sequence = 0;
		this.clock = options.clock || Date.now;
	}

	/** Appends one event with the next account-local sequence. */
	append(input = {}) {
		this.prune();
		this.sequence += 1;
		const event = createEvent({
			...input,
			accountId: this.accountId
		}, this.sequence, this.clock());
		this.events.push(event);
		this.prune();
		return event;
	}

	/** Returns a bounded replay strictly after one sequence. */
	replay(afterSequence = 0, limit = Limits.MAXIMUM_REPLAY_EVENTS) {
		this.prune();
		const bounded = Math.max(1, Math.min(Number(limit) || 100, Limits.MAXIMUM_REPLAY_EVENTS));
		return this.events
			.filter((event) => event.sequence > Number(afterSequence || 0))
			.slice(-bounded);
	}

	/** Returns cursor testimony needed for reconnect and gap detection. */
	cursor() {
		this.prune();
		return {
			accountId: this.accountId,
			firstSequence: this.events[0]?.sequence || this.sequence,
			lastSequence: this.sequence,
			eventCount: this.events.length
		};
	}

	/** Removes expired and count-excess events. */
	prune() {
		const cutoff = this.clock() - Limits.MAXIMUM_EVENT_AGE_MS;
		this.events = this.events.filter((event) => {
			return Date.parse(event.timestamp) >= cutoff;
		});
		if (this.events.length > Limits.MAXIMUM_EVENTS_PER_ACCOUNT) {
			this.events.splice(
				0,
				this.events.length - Limits.MAXIMUM_EVENTS_PER_ACCOUNT
			);
		}
	}
}

module.exports = {
	AccountLedger
};
