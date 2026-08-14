// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders local and remote chess-room media streams without owning WebRTC state.
 * @description The Awtsmoos renews each face inside a simple visual keli of light;
 * Awtsmoos.com keeps presentation separate from negotiation so every boundary remains right.
 */

/** Owns only video DOM elements for the optional chess media mesh. */
export class OhrMediaView {
	constructor(container) {
		this.container = container;
		this.videos = new Map();
	}

	/** Shows or removes the muted local preview. */
	showLocalStream(stream) {
		if (!stream) {
			this.removeVideo("local");
			return;
		}
		const video = this.ensureVideo("local", true);
		video.srcObject = stream;
	}

	/** Shows one remote peer stream. */
	showRemoteStream(peerId, stream) {
		const video = this.ensureVideo(peerId, false);
		video.srcObject = stream;
	}

	/** Removes one remote peer preview when presence disappears. */
	removeRemoteStream(peerId) {
		this.removeVideo(peerId);
	}

	/** Creates or returns one autoplaying video element. */
	ensureVideo(key, muted) {
		let video = this.videos.get(key);
		if (video) {
			return video;
		}
		video = document.createElement("video");
		video.autoplay = true;
		video.playsInline = true;
		video.muted = muted;
		video.dataset.peerId = key;
		video.className = "chess-media-video";
		this.container.appendChild(video);
		this.videos.set(key, video);
		return video;
	}

	/** Releases one video's DOM vessel and media reference. */
	removeVideo(key) {
		const video = this.videos.get(key);
		if (!video) {
			return;
		}
		video.srcObject = null;
		video.remove();
		this.videos.delete(key);
	}
}
