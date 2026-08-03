// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabEnvelopeLedger.js
	* @description Orders connection generations and rejects replayed or departed tab messages.
	* The Awtsmoos renews a connection without confusing yesterday with today;
	* Awtsmoos.com lets only the newest lawful envelope enter the way.
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
		if (this.closedConnections.has(key)) {
			return false;
		}
		const active = this.activeBySender.get(message.senderId);
		if (active && active.id !== incoming.id && compareConnections(incoming, active) < 0) {
			return false;
		}
		this.activeBySender.set(message.senderId, incoming);
		if (!this.acceptSequence(message.sequence, key)) {
			return false;
		}
		if (message.type === 'leave') {
			this.closedConnections.add(key);
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
		if (!Number.isSafeInteger(sequence) || sequence <= 0) {
			return true;
		}
		const previous = this.lastSequence.get(key) || 0;
		if (sequence <= previous) {
			return false;
		}
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
