//B"H
//Boruch Hashem
//Blessed is He

import {
	createAudioState,
	formatAudioSize,
	formatAudioTime,
	resetAudioState,
	revokeAudioSource
} from "./audioPlayerState.js";
import { statusNode } from "./audioOfferView.js";

/**
 * The visible player is a vessel for a living stream. It reflects state and
 * never decides how the Awtsmoos-breathed bytes cross the network.
 */
export function bindAudioPlayer(root) {
	const audio = root.querySelector("audio");
	const meter = root.querySelector(".player-meter");
	for (const eventName of ["loadedmetadata", "timeupdate", "durationchange", "progress"]) {
		audio.addEventListener(eventName, () => syncAudioPlayer(root));
	}
	audio.addEventListener("play", () => setPlayerState(root, "playing"));
	audio.addEventListener("pause", () => setPlayerState(root, "paused"));
	audio.addEventListener("ended", () => setPlayerState(root, "ended"));
	audio.addEventListener("error", () => { statusNode(root).textContent = mediaError(audio); });
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

export async function loadBlobAudioPlayer(root, result, signature = "") {
	if (!result?.objectUrl && !result?.url) {
		throw new Error("No audio URL returned.");
	}
	const audio = root.querySelector("audio");
	const source = result.objectUrl || result.url;
	resetAudioState(root);
	root.__awtsmoosAudio = createAudioState({ signature, mode: "blob", mime: result.mime });
	root.__awtsmoosAudio.done = true;
	root.__awtsmoosAudio.bytes = Number(result.size || 0);
	root.__awtsmoosAudio.objectUrl = source;
	revokeAudioSource(audio);
	audio.src = source;
	audio.dataset.objectUrl = source;
	root.querySelector(".audio-player-wrap").hidden = false;
	root.querySelector(".player-play").disabled = true;
	statusNode(root).textContent = `Audio fetched${formatAudioSize(result.size)}. Preparing player…`;
	audio.load();
	await waitForPlayable(audio);
	root.querySelector(".player-play").disabled = false;
	await audio.play();
	statusNode(root).textContent = `Playing MP3${formatAudioSize(result.size)}.`;
}

export function syncAudioPlayer(root, options = {}) {
	const audio = root.querySelector("audio");
	const meter = root.querySelector(".player-meter");
	const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
	const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
	const live = options.live ?? (root.__awtsmoosAudio?.mode === "streaming" && !root.__awtsmoosAudio?.done);
	const percent = duration ? Math.max(0, Math.min(100, current / duration * 100)) : live ? 100 : 0;
	meter.querySelector("span").style.width = `${percent}%`;
	meter.setAttribute("aria-valuenow", String(Math.round(percent)));
	root.querySelector(".player-time").textContent = `${formatAudioTime(current)} / ${live ? "live" : formatAudioTime(duration)}`;
	root.querySelector(".player-play").textContent = audio.paused ? "▶" : "❚❚";
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

function waitForPlayable(audio, timeoutMs = 12000) {
	if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => finish(new Error("Browser could not decode the generated audio.")), timeoutMs);
		const ready = () => finish();
		const failed = () => finish(new Error(mediaError(audio)));
		function finish(error = null) {
			clearTimeout(timer);
			audio.removeEventListener("canplay", ready);
			audio.removeEventListener("loadeddata", ready);
			audio.removeEventListener("error", failed);
			error ? reject(error) : resolve();
		}
		audio.addEventListener("canplay", ready, { once: true });
		audio.addEventListener("loadeddata", ready, { once: true });
		audio.addEventListener("error", failed, { once: true });
	});
}

function mediaError(audio) {
	return ({
		1: "Audio loading was aborted.",
		2: "Network error while loading audio.",
		3: "Browser could not decode this audio.",
		4: "Audio format is not supported."
	})[audio?.error?.code] || "Audio playback error.";
}
