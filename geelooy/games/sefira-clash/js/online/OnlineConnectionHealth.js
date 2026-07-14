//B"H
//Boruch Hashem
//Blessed is He

/**
 * Network health describes the temporary vessel without confusing it with match
 * truth. The Awtsmoos renews every receipt; Awtsmoos.com measures latency, jitter,
 * frame gaps, checksum failures, snapshot age, and reconnect attempts in plain words.
 */

import {
	nullableHealthValue,
	onlineHealthQuality,
	roundedHealthValue
} from './OnlineHealthQuality.js';

/** Collects browser-observed connection and authoritative-stream health. */
export class OnlineConnectionHealth {
	constructor() {
		this.checksumFailures = 0;
		this.expectedFrameStep = 2;
		this.frameGaps = 0;
		this.jitterMs = 0;
		this.lastFrame = null;
		this.lastLatencyMs = null;
		this.lastMatchId = null;
		this.lastSnapshotAt = null;
		this.latencyMs = null;
		this.legacySnapshots = 0;
		this.listeners = new Set();
		this.reconnectAttempts = 0;
		this.serverClockOffsetMs = 0;
		this.snapshotsReceived = 0;
		this.status = 'offline';
	}

	recordPong(sentAt, serverTime, receivedAt = Date.now()) {
		const roundTrip = Math.max(0, receivedAt - sentAt);
		const latency = roundTrip / 2;
		if (this.lastLatencyMs !== null) {
			const difference = Math.abs(latency - this.lastLatencyMs);
			this.jitterMs = this.jitterMs * 0.75 + difference * 0.25;
		}
		this.lastLatencyMs = latency;
		this.latencyMs = latency;
		this.serverClockOffsetMs = serverTime - (sentAt + latency);
		this.notify();
	}

	recordSnapshot(match, receivedAt = Date.now()) {
		if (this.lastMatchId !== match.matchId) {
			this.lastFrame = null;
			this.lastMatchId = match.matchId;
		}
		if (this.lastFrame !== null && match.frame > this.lastFrame) {
			const steps = Math.floor((match.frame - this.lastFrame) / this.expectedFrameStep);
			this.frameGaps += Math.max(0, steps - 1);
		}
		this.lastFrame = Math.max(this.lastFrame ?? match.frame, match.frame);
		this.lastSnapshotAt = receivedAt;
		this.snapshotsReceived += 1;
		this.notify();
	}

	recordChecksumFailure() {
		this.checksumFailures += 1;
		this.notify();
	}

	recordLegacySnapshot() {
		this.legacySnapshots += 1;
		this.notify();
	}

	recordReconnectAttempt(attempt) {
		this.reconnectAttempts = attempt;
		this.setStatus('reconnecting');
	}

	setExpectedFrameStep(step) {
		this.expectedFrameStep = Math.max(1, Number(step) || 2);
	}

	setStatus(status) {
		this.status = status;
		this.notify();
	}

	snapshot(now = Date.now()) {
		const snapshot = {
			checksumFailures: this.checksumFailures,
			frameGaps: this.frameGaps,
			jitterMs: roundedHealthValue(this.jitterMs),
			latencyMs: nullableHealthValue(this.latencyMs),
			reconnectAttempts: this.reconnectAttempts,
			serverClockOffsetMs: roundedHealthValue(this.serverClockOffsetMs),
			snapshotAgeMs: this.lastSnapshotAt ? Math.max(0, now - this.lastSnapshotAt) : null,
			snapshotsReceived: this.snapshotsReceived,
			status: this.status
		};
		return { ...snapshot, quality: onlineHealthQuality(snapshot) };
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	notify() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
