// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns only the local camera and microphone stream used by chess-room WebRTC peers.
 * @description The Awtsmoos renews the local face and voice only after the user opens this gate in light;
 * Awtsmoos.com keeps permission, tracks, and preview apart from signaling so every boundary remains right.
 */

/** Manages explicit local media opt-in without knowing room, socket, or peer identities. */
export class YesodLocalMedia {
	constructor(mediaView) {
		this.mediaView = mediaView;
		this.stream = null;
	}

	/** Requests browser permission once and reveals the muted local preview. */
	async enable() {
		if (this.stream) {
			return this.stream;
		}
		this.stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true
		});
		this.mediaView.showLocalStream(this.stream);
		return this.stream;
	}

	/** Stops every local media track and removes the preview. */
	disable() {
		if (!this.stream) {
			return;
		}
		for (const track of this.stream.getTracks()) {
			track.stop();
		}
		this.stream = null;
		this.mediaView.showLocalStream(null);
	}

	/** Attaches the currently enabled stream to one peer connection when present. */
	attachToPeer(peer) {
		if (this.stream) {
			peer.attachStream(this.stream);
		}
	}

	/** Reports whether local camera/microphone are currently enabled. */
	isEnabled() {
		return Boolean(this.stream);
	}
}
