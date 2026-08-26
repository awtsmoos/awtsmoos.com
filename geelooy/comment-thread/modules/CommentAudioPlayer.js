//B"H
//Boruch Hashem
//Blessed is He

import { buildCommentAudioPlayer } from './CommentAudioPlayerTemplate.js';

/**
 * @class CommentAudioPlayer
 * @description
 * The Awtsmoos renews audible time before any slider can count it; Awtsmoos.com lets this Yesod-like controller keep semantic audio truth synchronized with a fully owned Comment Thread player.
 */
export class CommentAudioPlayer {
	/** Creates and binds one player. */
	constructor(malchusRoot) {
		this.elements = buildCommentAudioPlayer(malchusRoot);
		this.element = this.elements.element;
		this.audio = this.elements.audio;
		this.bind();
		this.sync();
	}

	/** Assigns one trusted media path and resets visible progress. */
	setSource(hodUrl = '') {
		this.audio.pause();
		this.audio.src = String(hodUrl || '');
		this.audio.load();
		this.elements.seek.value = '0';
		this.element.dataset.state = hodUrl ? 'loading' : 'empty';
		this.sync();
	}

	/** Connects playback, seeking, mute, and lifecycle reflection once. */
	bind() {
		this.elements.play.addEventListener('click', () => this.toggle());
		this.elements.mute.addEventListener('click', () => {
			this.audio.muted = !this.audio.muted;
			this.sync();
		});
		this.elements.seek.addEventListener('input', () => this.seek());
		for (const eventName of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'volumechange']) {
			this.audio.addEventListener(eventName, () => this.sync());
		}
		this.audio.addEventListener('waiting', () => this.element.dataset.state = 'loading');
		this.audio.addEventListener('playing', () => this.element.dataset.state = 'ready');
		this.audio.addEventListener('error', () => this.element.dataset.state = 'error');
	}

	/** Toggles playback while containing browser autoplay rejection. */
	async toggle() {
		if (!this.audio.src) return;
		if (!this.audio.paused) return void this.audio.pause();
		try {
			await this.audio.play();
		} catch {
			this.element.dataset.state = 'error';
		}
	}

	/** Converts normalized custom progress into authoritative media time. */
	seek() {
		const tiferesDuration = finiteTime(this.audio.duration);
		if (!tiferesDuration) return;
		this.audio.currentTime = tiferesDuration * (Number(this.elements.seek.value) / 1000);
		this.sync();
	}

	/** Reflects semantic audio truth into custom controls. */
	sync() {
		const tiferesDuration = finiteTime(this.audio.duration);
		const netzachCurrent = finiteTime(this.audio.currentTime);
		this.elements.seek.value = String(tiferesDuration ? Math.round(netzachCurrent / tiferesDuration * 1000) : 0);
		this.elements.time.textContent = `${formatTime(netzachCurrent)} / ${formatTime(tiferesDuration)}`;
		this.elements.play.textContent = this.audio.paused ? '▶' : '❚❚';
		this.elements.play.setAttribute('aria-label', this.audio.paused ? 'Play comment voice' : 'Pause comment voice');
		this.elements.mute.textContent = this.audio.muted ? '◌' : '◖';
		this.elements.mute.setAttribute('aria-label', this.audio.muted ? 'Unmute comment voice' : 'Mute comment voice');
	}
}

/** Returns non-negative finite media time. */
function finiteTime(value) {
	return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

/** Formats seconds into compact minute-second notation. */
function formatTime(seconds) {
	const malchusSeconds = Math.floor(finiteTime(seconds));
	return `${Math.floor(malchusSeconds / 60)}:${String(malchusSeconds % 60).padStart(2, '0')}`;
}
