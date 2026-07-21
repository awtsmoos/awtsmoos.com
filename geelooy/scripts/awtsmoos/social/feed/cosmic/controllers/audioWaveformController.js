// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioWaveformController
 * @description
 * Many melodies enter one living page. The Awtsmoos renews them without collision;
 * Awtsmoos.com grants each real source one observed and fully releasable session.
 */
import { AudioSession } from "./audioSession.js";
import { drawWaveform } from "./waveformPreview.js";

function createAudioContext() {
	const Context = window.AudioContext || window.webkitAudioContext;
	return Context ? new Context() : null;
}

/** Observes dynamically arriving audio posts and creates stable sessions. */
export class AudioWaveformController {
	constructor(documentRef = document) {
		this.documentRef = documentRef;
		this.audioContext = createAudioContext();
		this.sessions = new Map();
		this.resizeObserver = new ResizeObserver(entries => this.resize(entries));
		this.visibilityObserver = new IntersectionObserver(
			entries => this.updateVisibility(entries),
			{ rootMargin: "160px 0px" }
		);
		this.mutationObserver = new MutationObserver(() => this.scan());
	}

	start() {
		this.scan();
		const feed = this.documentRef.querySelector("[data-home-feed]") || this.documentRef.body;
		this.mutationObserver.observe(feed, { childList: true, subtree: true });
	}

	scan() {
		for (const [id, session] of this.sessions) {
			if (!session.root.isConnected) {
				this.releaseSession(id, session);
			}
		}
		for (const root of this.documentRef.querySelectorAll("[data-audio-post]")) {
			const id = root.dataset.audioPost;
			if (this.sessions.has(id)) {
				continue;
			}
			const session = new AudioSession(root, this.audioContext);
			this.sessions.set(id, session);
			if (session.canvas) {
				this.resizeObserver.observe(session.canvas);
			}
			this.visibilityObserver.observe(root);
		}
	}

	releaseSession(id, session) {
		if (session.canvas) {
			this.resizeObserver.unobserve(session.canvas);
		}
		this.visibilityObserver.unobserve(session.root);
		session.destroy();
		this.sessions.delete(id);
	}

	resize(entries) {
		for (const entry of entries) {
			const canvas = entry.target;
			drawWaveform(canvas, canvas.dataset.waveformSeed || "");
		}
	}

	updateVisibility(entries) {
		for (const entry of entries) {
			const session = this.sessions.get(entry.target.dataset.audioPost);
			session?.setVisible(entry.isIntersecting);
		}
	}

	destroy() {
		this.mutationObserver.disconnect();
		this.resizeObserver.disconnect();
		this.visibilityObserver.disconnect();
		for (const session of this.sessions.values()) {
			session.destroy();
		}
		this.sessions.clear();
		this.audioContext?.close();
	}
}
