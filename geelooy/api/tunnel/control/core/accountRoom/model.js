// B"H
"use strict";
const crypto = require("node:crypto");
const Inputs = require("./input.js");

/**
 * @file One account's common table, where every shliach can be heard.
 * A message is a record, not proof of owner consent; conflicting orders
 * remain visible until an independently authenticated human resolves them.
 */
function room(store, accountId) {
	const account = String(accountId || "");
	if (!/^[A-Za-z0-9_-]{1,160}$/.test(account)) {
		throw Error("agent_room_invalid_account");
	}
	store.agentRooms ||= {};
	if (!Object.prototype.hasOwnProperty.call(store.agentRooms, account)) {
		Object.defineProperty(store.agentRooms, account, {
			value: { sequence: 0, agents: {}, messages: [] },
			enumerable: true, configurable: true, writable: true
		});
	}
	return store.agentRooms[account];
}

function join(store, accountId, actor, input, at = Date.now()) {
	const identity = Inputs.identity(input, actor);
	const ledger = room(store, accountId);
	if (!Object.prototype.hasOwnProperty.call(ledger.agents, identity.key) && Object.keys(ledger.agents).length >= 128) {
		throw Error("agent_room_capacity_reached");
	}
	const existing = Object.prototype.hasOwnProperty.call(ledger.agents, identity.key)
		? ledger.agents[identity.key] : null;
	Object.defineProperty(ledger.agents, identity.key, {
		value: { ...identity, lastSeenAt: at, joinedAt: existing?.joinedAt || at },
		configurable: true, enumerable: true, writable: true
	});
	return { agent: ledger.agents[identity.key], roomId: "account-coordination" };
}

function send(store, accountId, actor, input, at = Date.now()) {
	const identity = Inputs.identity(input, actor);
	const value = Inputs.message(input);
	const ledger = room(store, accountId);
	if (!Object.prototype.hasOwnProperty.call(ledger.agents, identity.key)) {
		throw Error("agent_room_join_required");
	}
	const replay = ledger.messages.find(row => row.key === identity.key && row.clientMessageId === value.clientMessageId);
	if (replay) return { message: replay, replayed: true };
	const entry = {
		...value,
		id: crypto.randomUUID(), sequence: ++ledger.sequence,
		key: identity.key, agentId: identity.agentId,
		sessionId: identity.sessionId, at
	};
	ledger.agents[identity.key].lastSeenAt = at;
	ledger.messages.push(entry);
	if (ledger.messages.length > 500) ledger.messages.splice(0, ledger.messages.length - 500);
	return { message: entry, replayed: false };
}

function snapshot(store, accountId, since = 0, at = Date.now()) {
	const ledger = room(store, accountId);
	const cursor = Math.max(0, Number(since) || 0);
	return {
		roomId: "account-coordination", sequence: ledger.sequence,
		agents: Object.values(ledger.agents).map(agent => ({ ...agent, online: at - agent.lastSeenAt < 90000 })),
		messages: ledger.messages.filter(message => message.sequence > cursor).slice(-100)
	};
}

module.exports = { join, room, send, snapshot };
