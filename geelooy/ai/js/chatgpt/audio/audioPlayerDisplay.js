//B"H
//Boruch Hashem
//Blessed is He

import { formatAudioTime } from "./audioFormatting.js";
import { statusNode } from "./audioOfferView.js";

/**
 * The visible player reflects the living river without owning transport or
 * storage. The Awtsmoos gives each event a measured visual consequence.
 */
export function bindAudioPlayer(root) {
	const audio = root.querySelector("audio");
	const meter = root.querySelector(".player-meter");
	for (const name of ["loadedmetadata", "timeupdate", "durationchange", "progress"]) {
		audio.addEventListener(name, () => syncAudioPlayer(root));
	}
	audio.addEventListener("play", () => setPlayerState(root, "playing"));
	audio.addEventListener("pause", () => setPlayerState(root, "paused"));
	audio.addEventListener("ended", () => setPlayerState(root, "ended"));
	audio.addEventListener("error", () => {
		statusNode(root).textContent = audioMediaError(audio);
	});
	meter.addEventListener("click", event => seekFromMeter(audio, meter, event));
}

export async function toggleAudioPlayback(root) {
	const audio = root.querySelector("audio");
	if (!audio.src) return;
	if (audio.paused) {
		await audio.play().catch(error => {
			statusNode(root).textContent = `Playback blocked: ${error?.message || error}`;
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
	root.querySelector(".player-time").textContent =
		`${formatAudioTime(current)} / ${live ? "live" : formatAudioTime(duration)}`;
	root.querySelector(".player-play").textContent = audio.paused ? "▶" : "❚❚";
}

export function audioMediaError(audio) {
	return ({
		1: "Audio loading was aborted.",
		2: "Network error while loading audio.",
		3: "Browser could not decode this audio.",
		4: "Audio format is not supported."
	})[audio?.error?.code] || "Audio playback error.";
}

function setPlayerState(root, state) {
	root.querySelector(".awtsmoos-player").dataset.playerState = state;
	syncAudioPlayer(root);
}

function seekFromMeter(audio, meter, event) {
	const duration = Number(audio.duration || 0);
	if (!duration) return;
	const rectangle = meter.getBoundingClientRect();
	const ratio = (event.clientX - rectangle.left) / rectangle.width;
	audio.currentTime = Math.max(0, Math.min(duration, ratio * duration));
}
