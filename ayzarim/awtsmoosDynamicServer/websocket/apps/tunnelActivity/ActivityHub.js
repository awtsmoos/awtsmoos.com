// B"H
// Boruch Hashem
// Blessed is He

const { eventEnvelope } = require("../../platform/ProtocolEnvelope.js");
const { AccountLedger } = require("./AccountLedger.js");
const Constants = require("./constants.js");
const { identifier } = require("./eventFactory.js");

/**
 * @file Owns account ledgers and authenticated realtime subscribers.
 * @description
 * The Awtsmoos renews publisher and observer, while Awtsmoos.com joins them only
 * inside one verified account. Filters may narrow rightful light, but no payload
 * can widen the account boundary established by the socket's trusted identity.
 */

class ActivityHub {
	constructor() {
		this.ledgers = new Map();
		this.subscribers = new Map();
	}

	/** Publishes one event and pushes it to matching same-account subscribers. */
	publish(input = {}) {
		const accountId = identifier(input.accountId);
		if (!accountId) {
			return null;
		}
		const event = this.ledger(accountId).append(input);
		for (const subscription of this.accountSubscribers(accountId)) {
			if (matches(event, subscription.filters)) {
				sendEvent(subscription.client, event);
			}
		}
		return event;
	}

	/** Subscribes one authenticated client to its account and optional narrowing filters. */
	subscribe(accountId, client, filters = {}) {
		this.unsubscribe(client);
		this.subscribers.set(client, {
			accountId: identifier(accountId),
			client,
			filters: normalizeFilters(filters)
		});
	}

	/** Removes all subscription testimony for one client. */
	unsubscribe(client) {
		this.subscribers.delete(client);
	}

	/** Returns bounded account replay and cursor state. */
	snapshot(accountId, afterSequence = 0, limit) {
		const ledger = this.ledger(identifier(accountId));
		return {
			cursor: ledger.cursor(),
			events: ledger.replay(afterSequence, limit),
			summary: summarize(ledger.events)
		};
	}

	ledger(accountId) {
		if (!this.ledgers.has(accountId)) {
			this.ledgers.set(accountId, new AccountLedger(accountId));
		}
		return this.ledgers.get(accountId);
	}

	accountSubscribers(accountId) {
		return [...this.subscribers.values()]
			.filter((subscription) => subscription.accountId === accountId);
	}
}

function normalizeFilters(filters = {}) {
	return Object.fromEntries([
		"tunnelId", "tunnelName", "missionId", "roomId", "agentId", "severity"
	].map((key) => [key, identifier(filters[key])]).filter(([, value]) => value));
}

function matches(event, filters) {
	return Object.entries(filters).every(([key, value]) => event[key] === value);
}

function sendEvent(client, event) {
	try {
		client.send(eventEnvelope(
			Constants.APPLICATION_ID,
			Constants.APPLICATION_VERSION,
			Constants.EVENT_TYPE,
			{ event }
		));
	} catch {}
}

function summarize(events) {
	return {
		connections: new Set(events.map((event) => event.connectionId).filter(Boolean)).size,
		agents: new Set(events.map((event) => event.agentId).filter(Boolean)).size,
		missions: new Set(events.map((event) => event.missionId).filter(Boolean)).size,
		rooms: new Set(events.map((event) => event.roomId).filter(Boolean)).size,
		actions: events.filter((event) => event.actionId).length
	};
}

module.exports = {
	ActivityHub,
	matches,
	normalizeFilters,
	summarize
};
