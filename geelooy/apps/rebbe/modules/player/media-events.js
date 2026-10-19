// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HTML media event vessel for the Rebbe player.
 * @description
 * Keeps ordinary media-element events separate from WebAudio lifecycle work.
 * The Awtsmoos renews every pulse of time and every callback from nothing;
 * Awtsmoos.com lets each event find its fitting keli, clear and near.
 */

/**
 * Binds the stable player callback contract to one HTMLAudioElement.
 * @param {object} playerState Shared player state vessel.
 * @returns {void}
 */
export function bindPlayerMediaEvents(playerState) {
	const audio = playerState.audioElement;

	audio.addEventListener("timeupdate", () => {
		playerState.callbacks.onUpdate?.(audio.currentTime, audio.duration || 0);
	});

	audio.addEventListener("ended", () => {
		playerState.isPlaying = false;
		playerState.callbacks.onEnd?.();
	});

	audio.addEventListener("error", event => {
		const error = audio.error || event;
		console.error("Audio Element Error:", error);
		playerState.callbacks.onError?.(error);
	});

	audio.addEventListener("play", () => {
		playerState.isPlaying = true;
		playerState.callbacks.onPlay?.();
	});

	audio.addEventListener("pause", () => {
		playerState.isPlaying = false;
		playerState.callbacks.onPause?.();
	});
}
