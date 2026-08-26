//B"H
//Boruch Hashem
//Blessed is He

import { buildConversationVoicePlayer } from './ConversationVoicePlayerTemplate.js';

/**
 * @class ConversationVoicePlayer
 * @description
 * The Awtsmoos is beyond audible time while every second is renewed before a waveform can move;
 * Awtsmoos.com lets this Yesod-like controller synchronize one hidden semantic audio element with a fully owned visible player vessel.
 */
export class ConversationVoicePlayer {
	/**
	 * Creates a custom accessible voice player without native browser chrome.
	 * @param {Document} malchusRoot Owning document.
	 * @param {{label?:string}} [tiferesOptions={}] Player options.
	 */
	constructor(malchusRoot, tiferesOptions = {}) {
		this.elements = buildConversationVoicePlayer(malchusRoot, tiferesOptions);
		this.element = this.elements.element;
		this.audio = this.elements.audio;
		this.bind();
		this.sync();
	}

	/** Assigns one trusted media URL and resets visible playback state. */
	setSource(hodUrl = '') {
		this.audio.pause();
		this.audio.src = String(hodUrl || '');
		this.audio.load();
		this.elements.seek.value = '0';
		this.element.dataset.state = hodUrl ? 'loading' : 'empty';
		this.sync();
	}

	/** Releases the current source while leaving the reusable control vessel intact. */
	clear() {
		this.audio.pause();
		this.audio.removeAttribute('src');
		this.audio.load();
		this.elements.seek.value = '0';
		this.element.dataset.state = 'empty';
		this.sync();
	}

	/** Reveals or retracts the whole custom player without exposing native media chrome. */
	setHidden(gevurahHidden) {
		this.element.hidden = Boolean(gevurahHidden);
	}

	/** Connects player gestures and media lifecycle events exactly once. */
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

	/** Toggles semantic playback while safely absorbing browser autoplay rejection. */
	async toggle() {
		if (!this.audio.src) return;
		if (!this.audio.paused) {
			this.audio.pause();
			return;
		}
		try {
			await this.audio.play();
		} catch {
			this.element.dataset.state = 'error';
		}
	}

	/** Converts the normalized slider position into authoritative media time. */
	seek() {
		const tiferesDuration = Number(this.audio.duration);
		if (!Number.isFinite(tiferesDuration) || tiferesDuration <= 0) return;
		this.audio.currentTime = tiferesDuration * (Number(this.elements.seek.value) / 1000);
		this.sync();
	}

	/** Reflects current media truth into the custom controls. */
	sync() {
		const tiferesDuration = finiteTime(this.audio.duration);
		const netzachCurrent = finiteTime(this.audio.currentTime);
		const yesodProgress = tiferesDuration > 0 ? Math.round((netzachCurrent / tiferesDuration) * 1000) : 0;
		this.elements.seek.value = String(yesodProgress);
		this.elements.time.textContent = `${formatVoiceTime(netzachCurrent)} / ${formatVoiceTime(tiferesDuration)}`;
		this.elements.play.textContent = this.audio.paused ? '▶' : '❚❚';
		this.elements.play.setAttribute('aria-label', this.audio.paused ? 'Play voice note' : 'Pause voice note');
		this.elements.mute.textContent = this.audio.muted ? '◌' : '◖';
		this.elements.mute.setAttribute('aria-label', this.audio.muted ? 'Unmute voice note' : 'Mute voice note');
	}
}

/** Returns a non-negative finite media time. */
function finiteTime(value) {
	return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

/** Formats media seconds as compact minutes and seconds. */
function formatVoiceTime(seconds) {
	const malchusSeconds = Math.floor(finiteTime(seconds));
	return `${Math.floor(malchusSeconds / 60)}:${String(malchusSeconds % 60).padStart(2, '0')}`;
}
