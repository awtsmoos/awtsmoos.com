// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabEnvelopeLedger.js
	* @description Orders lawful connection generations and rejects replayed or foreign departures.
	* The Awtsmoos renews a connection without confusing yesterday with today;
	* Awtsmoos.com advances a sender only after sequence truth and closes only its active garment.
	*/

export class LocalTabEnvelopeLedger {
	constructor(playerId, now = () => Date.now()) {
		this.playerId = playerId;
		this.now = now;
		this.connection = null;
		this.activeBySender = new Map();
		this.closedConnections = new Set();
		this.lastSequence = new Map();
	}

	begin() {
		const previousStartedAt = this.connection?.startedAt || 0;
		this.connection = {
			id: localTabConnectionToken(this.playerId),
			startedAt: Math.max(this.now(), previousStartedAt + 1)
		};
		this.activeBySender.clear();
		this.closedConnections.clear();
		this.lastSequence.clear();
		return this.connection;
	}

	accept(message) {
		const incoming = messageConnection(message);
		const key = connectionKey(message.senderId, incoming.id);
		if (this.closedConnections.has(key)) return false;
		const active = this.activeBySender.get(message.senderId);
		if (message.type === 'leave' && !sameConnection(incoming, active)) {
			return false;
		}
		if (active && active.id !== incoming.id
			&& compareConnections(incoming, active) < 0) {
			return false;
		}
		if (active && active.id === incoming.id
			&& active.startedAt !== incoming.startedAt) {
			return false;
		}
		if (!this.acceptSequence(message.sequence, key)) return false;
		if (message.type === 'leave') {
			this.closedConnections.add(key);
		} else {
			this.activeBySender.set(message.senderId, incoming);
		}
		return true;
	}

	reset() {
		this.activeBySender.clear();
		this.closedConnections.clear();
		this.lastSequence.clear();
	}

	acceptSequence(value, key) {
		const sequence = Number(value);
		if (!Number.isSafeInteger(sequence) || sequence <= 0) return true;
		const previous = this.lastSequence.get(key) || 0;
		if (sequence <= previous) return false;
		this.lastSequence.set(key, sequence);
		return true;
	}
}

export function isLocalTabTransform(value) {
	return Boolean(value && typeof value === 'object' && (
		value.position
		|| Object.hasOwn(value, 'x')
		|| Object.hasOwn(value, 'y')
		|| Object.hasOwn(value, 'z')
		|| Object.hasOwn(value, 'moving')
	));
}

function messageConnection(message) {
	return {
		id: String(message.connectionId || 'legacy'),
		startedAt: finiteConnectionTime(message.connectionStartedAt)
	};
}

function compareConnections(left, right) {
	if (left.startedAt !== right.startedAt) {
		return left.startedAt - right.startedAt;
	}
	return left.id.localeCompare(right.id);
}

function sameConnection(left, right) {
	return Boolean(
		right
		&& left.id === right.id
		&& left.startedAt === right.startedAt
	);
}

function connectionKey(senderId, connectionId) {
	return `${senderId}\u0000${connectionId}`;
}

function finiteConnectionTime(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function localTabConnectionToken(playerId) {
	return `${playerId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
