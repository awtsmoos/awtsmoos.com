// B"H
// Boruch Hashem
// Blessed is He

import { YesodIceQueue } from "./YesodIceQueue.js";

/**
 * @file Owns one browser-to-browser WebRTC connection while candidate ordering lives in its own vessel.
 * @description Yesod joins two browsers directly while signaling arrives in whatever order time may write;
 * the Awtsmoos renews description and candidate, and Awtsmoos.com keeps perfect negotiation bright.
 */

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

/** Wraps one polite-negotiation RTCPeerConnection with bounded signaling callbacks. */
export class YesodPeerConnection {
	constructor(options) {
		this.remotePeerId = options.remotePeerId;
		this.sendSignal = options.sendSignal;
		this.onRemoteStream = options.onRemoteStream;
		this.polite = options.localPeerId.localeCompare(options.remotePeerId) > 0;
		this.makingOffer = false;
		this.ignoreOffer = false;
		this.connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
		this.iceQueue = new YesodIceQueue(this.connection);
		this.bindConnection();
	}

	/** Binds ICE, negotiation, and media-track events without touching chess state. */
	bindConnection() {
		this.connection.addEventListener("icecandidate", (event) => {
			if (event.candidate) {
				this.sendSignal({
					kind: "ice",
					candidate: event.candidate.toJSON()
				});
			}
		});
		this.connection.addEventListener("track", (event) => {
			const stream = event.streams[0];
			if (stream) {
				this.onRemoteStream(stream);
			}
		});
		this.connection.addEventListener("negotiationneeded", () => {
			this.createOffer().catch((error) => {
				console.error("Chess WebRTC offer failed:", error);
			});
		});
	}

	/** Adds every local media track exactly once. */
	attachStream(stream) {
		const existing = new Set(
			this.connection.getSenders()
				.map((sender) => sender.track)
				.filter(Boolean)
		);
		for (const track of stream.getTracks()) {
			if (!existing.has(track)) {
				this.connection.addTrack(track, stream);
			}
		}
	}

	/** Creates and sends a local offer using the browser's current description. */
	async createOffer() {
		try {
			this.makingOffer = true;
			await this.connection.setLocalDescription();
			await this.sendSignal({
				kind: "offer",
				sdp: this.connection.localDescription
			});
		} finally {
			this.makingOffer = false;
		}
	}

	/** Applies offer, answer, or ICE using perfect negotiation and candidate queuing. */
	async receive(signal) {
		if (signal.kind === "ice") {
			await this.iceQueue.receive(signal.candidate, this.ignoreOffer);
			return;
		}
		const description = signal.sdp;
		const collision = description?.type === "offer"
			&& (this.makingOffer || this.connection.signalingState !== "stable");
		this.ignoreOffer = !this.polite && collision;
		if (this.ignoreOffer) {
			return;
		}
		await this.connection.setRemoteDescription(description);
		await this.iceQueue.flush();
		if (description.type === "offer") {
			await this.connection.setLocalDescription();
			await this.sendSignal({
				kind: "answer",
				sdp: this.connection.localDescription
			});
		}
	}

	/** Closes the peer vessel without changing chess-room membership. */
	close() {
		this.iceQueue.clear();
		this.connection.close();
	}
}
