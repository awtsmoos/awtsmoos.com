// B"H
// Boruch Hashem
// Blessed is He

import {
	MEDIA_SIGNAL,
	MEDIA_STATE
} from "../online/protocol.js";
import { YesodLocalMedia } from "./YesodLocalMedia.js";
import { YesodPeerConnection } from "./YesodPeerConnection.js";

/**
 * @file Coordinates same-room WebRTC peers while local camera ownership lives in its own vessel.
 * @description The Awtsmoos renews each peer-to-peer ray while the socket carries signaling alone;
 * Awtsmoos.com keeps media optional and direct, so chess never depends on camera, mic, or phone.
 */

/** Owns peer membership and signaling for one optional chess-room media mesh. */
export class YesodWebRtcMesh {
	constructor(socket, mediaView) {
		this.socket = socket;
		this.mediaView = mediaView;
		this.localMedia = new YesodLocalMedia(mediaView);
		this.roomId = "";
		this.localPeerId = "";
		this.peers = new Map();
	}

	/** Binds the mesh to one room snapshot; hardware remains disabled until explicit opt-in. */
	attach(snapshot) {
		this.roomId = snapshot.roomId;
		this.localPeerId = snapshot.peerId;
		this.syncPresence(snapshot.presence || []);
	}

	/** Enables local media and attaches it to every already-known remote peer. */
	async enable() {
		await this.localMedia.enable();
		for (const peer of this.peers.values()) {
			this.localMedia.attachToPeer(peer);
		}
		await this.socket.request(MEDIA_STATE, {
			roomId: this.roomId,
			enabled: true
		});
	}

	/** Disables local media, closes media peers, and leaves chess/chat membership intact. */
	async disable() {
		this.localMedia.disable();
		for (const peer of this.peers.values()) {
			peer.close();
		}
		this.peers.clear();
		await this.socket.request(MEDIA_STATE, {
			roomId: this.roomId,
			enabled: false
		});
	}

	/** Creates/removes peer vessels as room presence changes. */
	syncPresence(presence) {
		const remotePeers = presence.filter((member) => member.peerId !== this.localPeerId);
		const liveIds = new Set(remotePeers.map((member) => member.peerId));
		for (const member of remotePeers) {
			if (member.mediaEnabled || this.localMedia.isEnabled()) {
				this.ensurePeer(member.peerId);
			}
		}
		for (const [peerId, peer] of this.peers.entries()) {
			if (!liveIds.has(peerId)) {
				peer.close();
				this.peers.delete(peerId);
				this.mediaView.removeRemoteStream(peerId);
			}
		}
	}

	/** Applies one server-routed offer, answer, or ICE candidate. */
	async receiveSignal(payload) {
		if (payload.roomId !== this.roomId || !payload.fromPeerId) {
			return;
		}
		await this.ensurePeer(payload.fromPeerId).receive(payload.signal);
	}

	/** Creates one peer connection with callbacks into signaling and remote-media presentation. */
	ensurePeer(remotePeerId) {
		let peer = this.peers.get(remotePeerId);
		if (peer) {
			return peer;
		}
		peer = new YesodPeerConnection({
			localPeerId: this.localPeerId,
			remotePeerId,
			sendSignal: (signal) => this.sendSignal(remotePeerId, signal),
			onRemoteStream: (stream) => this.mediaView.showRemoteStream(remotePeerId, stream)
		});
		this.peers.set(remotePeerId, peer);
		this.localMedia.attachToPeer(peer);
		return peer;
	}

	/** Sends signaling metadata only; no video/audio bytes enter the WebSocket server. */
	async sendSignal(targetPeerId, signal) {
		await this.socket.request(MEDIA_SIGNAL, {
			roomId: this.roomId,
			targetPeerId,
			signal
		});
	}
}
