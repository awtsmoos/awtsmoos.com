//B"H
// Boruch Hashem
// Blessed is He

import { formatAudioTime } from "./audioFormatting.js";
import { bindAudioSeeking } from "./audioPlayerSeeking.js";
import {
	setAudioPlaybackUiState,
	showAudioError
} from "./audioUiState.js";

/**
 * The visible player reflects playback only; task progress remains another
 * vessel. The Awtsmoos creates pointer and keyboard seeking as one intention,
 * while Awtsmoos.com keeps time, slider semantics, and playback state aligned.
 */
export function bindAudioPlayer(root) {
	const audio = root.querySelector("audio");
	const meter = root.querySelector(".player-meter");
	for (const name of ["loadedmetadata", "timeupdate", "durationchange", "progress"]) {
		audio.addEventListener(name, () => syncAudioPlayer(root));
	}
	audio.addEventListener("play", () => reflectPlaybackState(root, "playing"));
	audio.addEventListener("pause", () => reflectPlaybackState(root, "paused"));
	audio.addEventListener("ended", () => reflectPlaybackState(root, "ready"));
	audio.addEventListener("error", () => {
		showAudioError(root, audioMediaError(audio), "play");
	});
	bindAudioSeeking(audio, meter, () => syncAudioPlayer(root));
}

export async function toggleAudioPlayback(root) {
	const audio = root.querySelector("audio");
	if (!audio.src) {
		return;
	}
	if (audio.paused) {
		await audio.play().catch(error => {
			showAudioError(root, `Playback blocked: ${error?.message || error}`, "play");
		});
		return;
	}
	audio.pause();
}

export function syncAudioPlayer(root, options = {}) {
	const audio = root.querySelector("audio");
	const meter = root.querySelector(".player-meter");
	const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
	const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
	const live = options.live ?? (
		root.__awtsmoosAudio?.mode === "streaming"
		&& !root.__awtsmoosAudio?.done
	);
	const percent = duration
		? Math.max(0, Math.min(100, current / duration * 100))
		: live ? 100 : 0;
	meter.querySelector("span").style.width = `${percent}%`;
	meter.setAttribute("aria-valuenow", String(Math.round(percent)));
	meter.setAttribute("aria-valuetext", playbackValueText(current, duration, live));
	meter.setAttribute("aria-disabled", String(!duration));
	meter.tabIndex = duration ? 0 : -1;
	root.querySelector(".player-time").textContent =
		`${formatAudioTime(current)} / ${live ? "live" : formatAudioTime(duration)}`;
	const playButton = root.querySelector(".player-play");
	playButton.textContent = audio.paused ? "▶" : "❚❚";
	playButton.setAttribute("aria-label", audio.paused ? "Play audio" : "Pause audio");
	playButton.setAttribute("aria-pressed", String(!audio.paused));
}

export function audioMediaError(audio) {
	return ({
		1: "Audio loading was aborted.",
		2: "Network error while loading audio.",
		3: "Browser could not decode this audio.",
		4: "Audio format is not supported."
	})[audio?.error?.code] || "Audio playback error.";
}

function reflectPlaybackState(root, state) {
	const audio = root.querySelector("audio");
	if (!audio?.src) {
		return;
	}
	root.querySelector(".awtsmoos-player").dataset.playerState = state;
	syncAudioPlayer(root);
	setAudioPlaybackUiState(root, state, {
		message: playbackMessage(root, state)
	});
}

function playbackMessage(root, state) {
	if (state === "playing") {
		return root.__awtsmoosAudio?.done
			? "Playing audio."
			: "Playing while audio continues to arrive.";
	}
	if (state === "paused") {
		return "Playback paused.";
	}
	return "Audio is ready to play again.";
}

function playbackValueText(current, duration, live) {
	if (!duration) {
		return live ? "Live audio" : "Playback position unavailable";
	}
	return `${formatAudioTime(current)} of ${formatAudioTime(duration)}`;
}
