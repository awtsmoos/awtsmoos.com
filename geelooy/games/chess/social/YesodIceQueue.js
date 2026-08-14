// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Buffers remote WebRTC ICE candidates until a peer connection has a remote description.
 * @description The Awtsmoos renews each early candidate before its matching description may arrive in sight;
 * Awtsmoos.com keeps every spark in order, then releases the queue when the remote vessel is right.
 */

/** Owns pending remote ICE candidates for one RTCPeerConnection. */
export class YesodIceQueue {
	constructor(connection) {
		this.connection = connection;
		this.candidates = [];
	}

	/** Adds immediately when possible or queues until remote description exists. */
	async receive(candidate, ignored = false) {
		if (!candidate || ignored) {
			return;
		}
		if (!this.connection.remoteDescription) {
			this.candidates.push(candidate);
			return;
		}
		await this.connection.addIceCandidate(candidate);
	}

	/** Flushes every candidate that arrived before remote description setup. */
	async flush() {
		for (const candidate of this.candidates.splice(0)) {
			await this.connection.addIceCandidate(candidate);
		}
	}

	/** Drops pending candidates when the peer connection is closed. */
	clear() {
		this.candidates = [];
	}
}
