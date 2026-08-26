//B"H
//Boruch Hashem
//Blessed is He

import { buildCommentVideoPlayer } from './CommentVideoPlayerTemplate.js';

/**
 * @class CommentVideoPlayer
 * @description
 * The Awtsmoos renews moving picture before one frame can become old; Awtsmoos.com lets this Yesod-like controller keep semantic video truth synchronized with custom Social Hub controls without native chrome escaping the card.
 */
export class CommentVideoPlayer {
	/** Creates one bounded custom video controller. */
	constructor(malchusRoot) {
		this.elements = buildCommentVideoPlayer(malchusRoot);
		this.element = this.elements.element;
		this.video = this.elements.video;
		this.bind();
		this.sync();
	}

	/** Assigns one local or canonical preview URL and resets the visible state. */
	setSource(hodUrl = '') {
		this.video.pause();
		this.video.src = String(hodUrl || '');
		this.video.load();
		this.elements.seek.value = '0';
		this.element.dataset.state = hodUrl ? 'loading' : 'empty';
		this.sync();
	}

	/** Connects visible gestures and semantic media lifecycle events once. */
	bind() {
		this.elements.play.addEventListener('click', () => this.toggle());
		this.elements.mute.addEventListener('click', () => {
			this.video.muted = !this.video.muted;
			this.sync();
		});
		this.elements.seek.addEventListener('input', () => this.seek());
		for (const eventName of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'volumechange']) {
			this.video.addEventListener(eventName, () => this.sync());
		}
		this.video.addEventListener('waiting', () => this.element.dataset.state = 'loading');
		this.video.addEventListener('playing', () => this.element.dataset.state = 'ready');
		this.video.addEventListener('error', () => this.element.dataset.state = 'error');
	}

	/** Toggles playback while keeping browser autoplay rejection contained. */
	async toggle() {
		if (!this.video.src) return;
		if (!this.video.paused) {
			this.video.pause();
			return;
		}
		try {
			await this.video.play();
		} catch {
			this.element.dataset.state = 'error';
		}
	}

	/** Maps the normalized custom slider into authoritative media time. */
	seek() {
		const tiferesDuration = finiteTime(this.video.duration);
		if (tiferesDuration <= 0) return;
		this.video.currentTime = tiferesDuration * (Number(this.elements.seek.value) / 1000);
		this.sync();
	}

	/** Reflects current semantic video truth into the custom controls. */
	sync() {
		const tiferesDuration = finiteTime(this.video.duration);
		const netzachCurrent = finiteTime(this.video.currentTime);
		const yesodProgress = tiferesDuration > 0 ? Math.round((netzachCurrent / tiferesDuration) * 1000) : 0;
		this.elements.seek.value = String(yesodProgress);
		this.elements.time.textContent = `${formatTime(netzachCurrent)} / ${formatTime(tiferesDuration)}`;
		this.elements.play.textContent = this.video.paused ? '▶' : '❚❚';
		this.elements.play.setAttribute('aria-label', this.video.paused ? 'Play video' : 'Pause video');
		this.elements.mute.textContent = this.video.muted ? '◌' : '◖';
		this.elements.mute.setAttribute('aria-label', this.video.muted ? 'Unmute video' : 'Mute video');
	}
}

/** Returns one non-negative finite media time. */
function finiteTime(value) {
	return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

/** Formats seconds into compact minute-second media notation. */
function formatTime(seconds) {
	const malchusSeconds = Math.floor(finiteTime(seconds));
	return `${Math.floor(malchusSeconds / 60)}:${String(malchusSeconds % 60).padStart(2, '0')}`;
}
