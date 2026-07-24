//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");
const { ROOM_PROTOCOL_VERSION } = require("./requestOptions.js");

/**
 * B"H
 *
 * Sequence is a measured footprint, not the source of continuity. The Awtsmoos
 * recreates every before and after; Awtsmoos.com gives clients a bounded ledger
 * so duplication and silence can be distinguished without pretending eternity.
 */

class SnapshotEnvelopeLedger {
	/** Creates an ordered ledger beginning after the reconnect cursor. */
	constructor(options = {}) {
		this.missionId = String(options.missionId || "");
		this.sequence = boundedSequence(options.lastSequence);
		this.lastHash = "";
	}

	/**
	 * Creates one flat client-compatible frame when meaningful state changed.
	 *
	 * @param {object} snapshot
	 * 	The real mission snapshot or structured error.
	 * @param {boolean} [force=false]
	 * 	Whether a reconnect must receive an immediate frame.
	 * @returns {object|null}
	 * 	The versioned frame or null when the snapshot is unchanged.
	 */
	next(snapshot, force = false) {
		const hash = snapshotHash(snapshot);
		if (!force && hash === this.lastHash) {
			return null;
		}

		this.lastHash = hash;
		this.sequence += 1;
		const resumeToken = `room_${this.sequence}_${hash.slice(0, 18)}`;

		return {
			...snapshot,
			protocolVersion: ROOM_PROTOCOL_VERSION,
			eventId: `mission_${this.sequence}_${hash.slice(0, 18)}`,
			sequence: this.sequence,
			missionId: snapshot.missionId || this.missionId,
			roomId: snapshot.roomId || snapshot.missionId || this.missionId,
			serverTimestamp: new Date().toISOString(),
			resumeToken
		};
	}
}

function snapshotHash(snapshot) {
	return crypto
		.createHash("sha256")
		.update(stableStringify(snapshot))
		.digest("hex");
}

function stableStringify(value, key = "") {
	if (volatileKey(key)) {
		return "undefined";
	}
	if (!value || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(item => stableStringify(item)).join(",")}]`;
	}

	const keys = Object.keys(value).sort();
	return `{${keys.map(name => (
		`${JSON.stringify(name)}:${stableStringify(value[name], name)}`
	)).join(",")}}`;
}

function volatileKey(key) {
	return [
		"at",
		"eventId",
		"protocolVersion",
		"resumeToken",
		"sequence",
		"serverTimestamp"
	].includes(key);
}

function boundedSequence(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 0;
	}
	return Math.max(0, Math.min(Math.floor(number), 1000000000));
}

module.exports = {
	SnapshotEnvelopeLedger,
	snapshotHash
};
