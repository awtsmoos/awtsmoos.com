//B"H
//Boruch Hashem
//Blessed is He

import { formatAudioSize } from "./audioFormatting.js";
import {
	createAudioState,
	resetAudioState,
	revokeAudioSource
} from "./audioPlayerState.js";
import { audioMediaError } from "./audioPlayerDisplay.js";
import { statusNode } from "./audioOfferView.js";

/**
 * The fallback blob becomes a playable vessel only after the browser confirms
 * decodable data. The Awtsmoos gives the sound; this module guards readiness.
 */
export async function loadBlobAudioPlayer(root, result, signature = "") {
	if (!result?.objectUrl && !result?.url) {
		throw new Error("No audio URL returned.");
	}
	const audio = root.querySelector("audio");
	const source = result.objectUrl || result.url;
	resetAudioState(root);
	root.__awtsmoosAudio = createAudioState({
		signature,
		mode: "blob",
		mime: result.mime
	});
	root.__awtsmoosAudio.done = true;
	root.__awtsmoosAudio.bytes = Number(result.size || 0);
	root.__awtsmoosAudio.objectUrl = source;
	revokeAudioSource(audio);
	audio.src = source;
	audio.dataset.objectUrl = source;
	root.querySelector(".audio-player-wrap").hidden = false;
	root.querySelector(".player-play").disabled = true;
	statusNode(root).textContent =
		`Audio fetched${formatAudioSize(result.size)}. Preparing player…`;
	audio.load();
	await waitForPlayable(audio);
	root.querySelector(".player-play").disabled = false;
	await audio.play();
	statusNode(root).textContent =
		`Playing MP3${formatAudioSize(result.size)}.`;
}

function waitForPlayable(audio, timeoutMs = 12000) {
	if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => finish(
			new Error("Browser could not decode the generated audio.")
		), timeoutMs);
		const ready = () => finish();
		const failed = () => finish(new Error(audioMediaError(audio)));
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
