//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * Events arrive as many sparks, yet the Awtsmoos creates their one order anew.
 * This ledger is the Gevurah of Awtsmoos.com: it refuses duplication, contains
 * gaps, and lets only a truthful bounded sequence enter the visible room.
 */
const DEFAULT_SEEN_LIMIT = 512;
const DEFAULT_PENDING_LIMIT = 64;

/** Owns bounded event identity, ordering, and resume state for one room. */
export class RoomFrameLedger {
	/**
	 * @param {string} missionId
	 * 	The mission whose ordered event stream is guarded.
	 * @param {{seenLimit?: number, pendingLimit?: number}} options
	 * 	Boundaries preventing unbounded browser memory growth.
	 */
	constructor(missionId, options = {}) {
		this.missionId = missionId || "";
		this.seenLimit = options.seenLimit || DEFAULT_SEEN_LIMIT;
		this.pendingLimit = options.pendingLimit || DEFAULT_PENDING_LIMIT;
		this.seenIds = new Set();
		this.seenOrder = [];
		this.pending = new Map();
		this.lastSequence = 0;
		this.resumeToken = "";
	}
	/**
	 * Accepts one normalized envelope and releases newly contiguous frames.
	 *
	 * @param {object} envelope
	 * 	A validated room envelope produced by the protocol parser.
	 * @returns {{frames: object[], status: string, detail?: object}}
	 * 	Delivered frames and a stable diagnostic decision.
	 */
	ingest(envelope = {}) {
		if (envelope.missionId && envelope.missionId !== this.missionId) {
			return { frames: [], status: "room-mismatch" };
		}
		if (!envelope.eventId) {
			return { frames: [], status: "missing-event-id" };
		}
		if (this.seenIds.has(envelope.eventId)) {
			return { frames: [], status: "duplicate" };
		}
		if (!Number.isFinite(envelope.sequence)) {
			this.remember(envelope.eventId);
			this.captureResume(envelope);
			return { frames: [envelope], status: "accepted-unsequenced" };
		}
		if (envelope.sequence <= this.lastSequence) {
			this.remember(envelope.eventId);
			return { frames: [], status: "stale-sequence" };
		}
		if (envelope.sequence > this.lastSequence + 1) {
			return this.bufferGap(envelope);
		}
		this.remember(envelope.eventId);
		return {
			frames: this.releaseContiguous(envelope),
			status: "accepted-sequenced"
		};
	}
	/** Returns the minimal cursor safe to send during reconnection. */
	snapshot() {
		return {
			lastSequence: this.lastSequence,
			resumeToken: this.resumeToken
		};
	}
	bufferGap(envelope) {
		if (this.pending.size >= this.pendingLimit) {
			return { frames: [], status: "pending-overflow" };
		}
		this.remember(envelope.eventId);
		this.pending.set(envelope.sequence, envelope);
		return {
			frames: [],
			status: "sequence-gap",
			detail: {
				expected: this.lastSequence + 1,
				received: envelope.sequence
			}
		};
	}
	releaseContiguous(firstEnvelope) {
		const released = [];
		let current = firstEnvelope;
		while (current) {
			released.push(current);
			this.lastSequence = current.sequence;
			this.captureResume(current);
			const nextSequence = this.lastSequence + 1;
			current = this.pending.get(nextSequence);
			this.pending.delete(nextSequence);
		}
		return released;
	}
	captureResume(envelope) {
		if (envelope.resumeToken) {
			this.resumeToken = envelope.resumeToken;
		}
	}
	remember(eventId) {
		this.seenIds.add(eventId);
		this.seenOrder.push(eventId);
		while (this.seenOrder.length > this.seenLimit) {
			this.seenIds.delete(this.seenOrder.shift());
		}
	}
}
