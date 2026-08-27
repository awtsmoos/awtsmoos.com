// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { ROOM_PROTOCOL_VERSION } = require("./requestOptions.js");

/**
 * @file Seals meaningful mission snapshots into deduplicated SSE envelopes.
 * @description The Awtsmoos renews every instant while Awtsmoos.com distinguishes
 * a changed mission from a changed observation clock; truth may flow, noise must not grow.
 */
class SnapshotEnvelopeLedger {
	/** Creates one ordered ledger beginning after the reconnect cursor. */
	constructor(options = {}) {
		this.missionId = String(options.missionId || "");
		this.sequence = boundedSequence(options.lastSequence);
		this.lastHash = "";
	}

	/**
	 * Emits one client frame when semantic mission state changed or reconnect forces it.
	 * @param {object} snapshot Current authorized mission snapshot.
	 * @param {boolean} [force=false] Whether reconnect requires an immediate witness.
	 * @returns {object|null} Versioned frame, or null for semantically unchanged state.
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

/** Hashes only mission-semantic state, never transport or live observation clocks. */
function snapshotHash(snapshot) {
	return crypto
		.createHash("sha256")
		.update(stableStringify(snapshot))
		.digest("hex");
}

/** Recursively serializes sorted keys while retaining path context for narrow volatility. */
function stableStringify(value, path = []) {
	if (volatilePath(path)) {
		return "undefined";
	}
	if (!value || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map((item, index) => (
			stableStringify(item, [...path, String(index)])
		)).join(",")}]`;
	}
	const keys = Object.keys(value).sort();
	return `{${keys.map(name => (
		`${JSON.stringify(name)}:${stableStringify(value[name], [...path, name])}`
	)).join(",")}}`;
}

/** Keeps transport clocks volatile while ignoring only liveProgress.observedAt semantically. */
function volatilePath(path) {
	const key = path[path.length - 1] || "";
	if ([
		"at",
		"eventId",
		"protocolVersion",
		"resumeToken",
		"sequence",
		"serverTimestamp"
	].includes(key)) {
		return true;
	}
	return key === "observedAt" && path[path.length - 2] === "liveProgress";
}

/** Bounds a reconnect cursor so hostile or malformed values cannot inflate sequence state. */
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
