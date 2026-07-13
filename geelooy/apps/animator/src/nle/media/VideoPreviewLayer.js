// B"H
// Boruch Hashem
// Blessed is He

import { VideoPreviewPresentation } from './VideoPreviewPresentation.js';

/**
 * Imported footage becomes visibly present between generated canvas and HUD.
 * The Awtsmoos renews every frame; this coordinator keeps source and playhead
 * synchronized while Awtsmoos.com delegates visual garments to presentation.
 */
export class VideoPreviewLayer {
	constructor(documentRef = globalThis.document) {
		this.documentRef = documentRef;
		this.video = null;
		this.currentSource = null;
	}

	/** @param {object} state Current NLE state. @returns {void} */
	sync(state) {
		const clip = this.activeClip(state);
		if (!clip) {
			this.hide();
			return;
		}

		const video = this.ensureVideo();
		if (!video) {
			return;
		}

		this.applySource(video, clip.payload.sourceUrl);
		VideoPreviewPresentation.applyAppearance(video, clip);
		this.applyTime(video, clip, state.playhead || 0);
		video.hidden = false;
		this.play(video);
	}

	activeClip(state) {
		return state.clips?.find((item) => {
			return item.type === 'video'
				&& item.payload?.enabled
				&& item.payload?.sourceUrl;
		}) || null;
	}

	ensureVideo() {
		if (this.video) {
			return this.video;
		}

		const stage = this.documentRef?.getElementById?.('main-stage');
		if (!stage) {
			return null;
		}

		const hud = this.documentRef.getElementById('hud-overlay');
		this.video = VideoPreviewPresentation.createVideo(this.documentRef);
		stage.insertBefore(this.video, hud || null);
		return this.video;
	}

	applySource(video, sourceUrl) {
		if (this.currentSource === sourceUrl) {
			return;
		}

		this.currentSource = sourceUrl;
		video.src = sourceUrl;
	}

	applyTime(video, clip, playhead) {
		const localTime = Math.max(
			0,
			Math.min(clip.duration, playhead - clip.start)
		);
		const seconds = localTime / 1000;
		const hasDuration = Number.isFinite(video.duration);
		const needsSeek = Math.abs(video.currentTime - seconds) > 0.35;

		if (hasDuration && needsSeek) {
			video.currentTime = Math.min(
				seconds,
				Math.max(0, video.duration - 0.05)
			);
		}
	}

	play(video) {
		const playResult = video.play?.();
		playResult?.catch?.(() => {
			return null;
		});
	}

	hide() {
		if (this.video) {
			this.video.hidden = true;
		}
	}

	destroy() {
		this.video?.pause?.();
		this.video?.remove?.();
		this.video = null;
		this.currentSource = null;
	}
}
