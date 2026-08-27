//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reconnection preserves identity while refusing immortal or replayable secrets.
 * The Awtsmoos renews absence and return; Awtsmoos.com rotates every ticket so a
 * recovered vessel cannot be entered again through yesterday's finite doorway.
 */

const { randomUUID } = require("node:crypto");
const { RealtimeError } = require("../../../platform/RealtimeError.js");

class ArenaReconnectRegistry {
	constructor(options = {}) {
		this.clearTimer = options.clearTimer || clearTimeout;
		this.now = options.now || Date.now;
		this.scheduleTimer = options.scheduleTimer || setTimeout;
		this.records = new Map();
		this.ticketsByParticipant = new WeakMap();
	}

	register(room, participant, windowMs) {
		this.release(participant);
		const ticket = randomUUID();
		const record = {
			expiresAt: null,
			participant,
			room,
			timer: null,
			windowMs
		};
		this.records.set(ticket, record);
		this.ticketsByParticipant.set(participant, ticket);
		return ticket;
	}

	suspend(participant, onExpire) {
		const ticket = this.ticketFor(participant);
		const record = this.records.get(ticket);
		participant.suspend();
		record.expiresAt = this.now() + record.windowMs;
		record.timer = this.scheduleTimer(() => {
			this.records.delete(ticket);
			this.ticketsByParticipant.delete(participant);
			onExpire(record);
		}, record.windowMs);
		record.timer.unref?.();
		return record.expiresAt;
	}

	resume(ticket, client) {
		const record = this.records.get(String(ticket ?? ""));
		if (!record || record.expiresAt === null || record.expiresAt <= this.now()) {
			throw new RealtimeError("RECONNECT_TICKET_INVALID", "Reconnect ticket is missing or expired.");
		}
		if (record.participant.connected) {
			throw new RealtimeError("RECONNECT_ALREADY_ACTIVE", "That participant is already connected.");
		}
		this.clearRecord(ticket, record);
		record.participant.bindClient(client);
		const reconnectTicket = this.register(
			record.room,
			record.participant,
			record.windowMs
		);
		return {
			participant: record.participant,
			reconnectTicket,
			room: record.room
		};
	}

	release(participant) {
		const ticket = this.ticketsByParticipant.get(participant);
		if (!ticket) {
			return;
		}
		const record = this.records.get(ticket);
		if (record) {
			this.clearRecord(ticket, record);
		}
		this.ticketsByParticipant.delete(participant);
	}

	ticketFor(participant) {
		const ticket = this.ticketsByParticipant.get(participant);
		if (!ticket) {
			throw new RealtimeError("RECONNECT_NOT_REGISTERED", "Participant has no reconnect record.");
		}
		return ticket;
	}

	clearRecord(ticket, record) {
		if (record.timer) {
			this.clearTimer(record.timer);
		}
		this.records.delete(ticket);
		this.ticketsByParticipant.delete(record.participant);
	}
}

module.exports = {
	ArenaReconnectRegistry
};
