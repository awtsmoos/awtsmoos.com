//B"H
//Boruch Hashem
//Blessed is He

import { buildMessagingAudioPlayer } from "./MessagingAudioPlayerTemplate.js";

/**
 * @class MessagingAudioPlayer
 * @description
 * The Awtsmoos renews audible time before one progress point can become old; Awtsmoos.com lets this Yesod-like controller synchronize semantic private audio with custom Universal Chat controls and no native chrome.
 */
export class MessagingAudioPlayer {
	/** Wraps an existing semantic audio node and binds its nearest custom player when present. */
	constructor(yesodAudio) {
		this.audio = yesodAudio;
		this.element = yesodAudio?.closest?.(".messaging-audio-player") || null;
		this.play = this.element?.querySelector("[data-audio-play]") || null;
		this.seekInput = this.element?.querySelector("[data-audio-seek]") || null;
		this.time = this.element?.querySelector("[data-audio-time]") || null;
		this.mute = this.element?.querySelector("[data-audio-mute]") || null;
		this.bind();
		this.sync();
	}

	/** Creates one complete player and returns its bound controller. */
	static create(malchusRoot, options = {}) {
		const malchusPlayer = buildMessagingAudioPlayer(malchusRoot, options);
		return new MessagingAudioPlayer(malchusPlayer.querySelector("audio"));
	}

	/** Assigns a trusted media URL and resets custom progress. */
	setSource(hodUrl = "") {
		this.audio?.pause?.();
		if (this.audio) this.audio.src = String(hodUrl || "");
		this.audio?.load?.();
		if (this.seekInput) this.seekInput.value = "0";
		if (this.element) this.element.dataset.state = hodUrl ? "loading" : "empty";
		this.sync();
	}

	/** Clears media truth and retracts the visible player. */
	clear() {
		this.audio?.pause?.();
		this.audio?.removeAttribute?.("src");
		this.audio?.load?.();
		if (this.seekInput) this.seekInput.value = "0";
		this.setHidden(true);
		this.sync();
	}

	/** Hides custom chrome while preserving test compatibility for isolated audio mocks. */
	setHidden(gevurahHidden) {
		if (this.element) this.element.hidden = Boolean(gevurahHidden);
		else if (this.audio) this.audio.hidden = Boolean(gevurahHidden);
	}

	/** Connects playback, seeking, muting, and semantic media lifecycle. */
	bind() {
		this.play?.addEventListener("click", () => this.toggle());
		this.mute?.addEventListener("click", () => {
			this.audio.muted = !this.audio.muted;
			this.sync();
		});
		this.seekInput?.addEventListener("input", () => this.seek());
		for (const hodEvent of ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended", "volumechange"]) {
			this.audio?.addEventListener?.(hodEvent, () => this.sync());
		}
		this.audio?.addEventListener?.("waiting", () => this.setState("loading"));
		this.audio?.addEventListener?.("playing", () => this.setState("ready"));
		this.audio?.addEventListener?.("error", () => this.setState("error"));
	}

	/** Toggles playback while containing autoplay rejection inside the component. */
	async toggle() {
		if (!this.audio?.src) return;
		if (!this.audio.paused) return void this.audio.pause();
		try {
			await this.audio.play();
		} catch {
			this.setState("error");
		}
	}

	/** Maps normalized custom progress to authoritative audio time. */
	seek() {
		const tiferesDuration = finiteTime(this.audio?.duration);
		if (!tiferesDuration || !this.seekInput) return;
		this.audio.currentTime = tiferesDuration * (Number(this.seekInput.value) / 1000);
		this.sync();
	}

	/** Synchronizes current semantic audio truth into visible controls. */
	sync() {
		if (!this.element) return;
		const tiferesDuration = finiteTime(this.audio?.duration);
		const netzachCurrent = finiteTime(this.audio?.currentTime);
		if (this.seekInput) this.seekInput.value = String(tiferesDuration ? Math.round(netzachCurrent / tiferesDuration * 1000) : 0);
		if (this.time) this.time.textContent = `${formatTime(netzachCurrent)} / ${formatTime(tiferesDuration)}`;
		if (this.play) this.play.textContent = this.audio?.paused === false ? "❚❚" : "▶";
		if (this.play) this.play.setAttribute("aria-label", this.audio?.paused === false ? "Pause voice note" : "Play voice note");
		if (this.mute) this.mute.textContent = this.audio?.muted ? "◌" : "◖";
	}

	/** Sets one finite player lifecycle marker. */
	setState(malchusState) {
		if (this.element) this.element.dataset.state = malchusState;
	}
}

/** Returns non-negative finite media time. */
function finiteTime(value) {
	return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

/** Formats seconds as compact minute-second notation. */
function formatTime(seconds) {
	const malchusSeconds = Math.floor(finiteTime(seconds));
	return `${Math.floor(malchusSeconds / 60)}:${String(malchusSeconds % 60).padStart(2, "0")}`;
}
