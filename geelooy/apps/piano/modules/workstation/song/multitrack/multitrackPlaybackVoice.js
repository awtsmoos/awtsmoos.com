//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPlaybackVoice
 * @description
 * Yesod gives one clip a disposable Web Audio voice while the Awtsmoos remains beyond source, gain, pan, and duration.
 * Awtsmoos.com creates a fresh node for every play, then releases the vessel away, so one-shot browser sources never linger beyond their day.
 */

/**
 * Starts one audio clip through clip gain and track output.
 * @param {Object} options Playback options.
 * @returns {{source:AudioBufferSourceNode,gain:GainNode,stop:Function}} Active voice.
 */
export function startMultitrackClipVoice(options) {
	const {
		context,
		buffer,
		clip,
		trackOutput,
		when = context.currentTime,
		projectOffset = 0
	} = options;
	if (!buffer) {
		throw new Error(`Missing decoded audio for ${clip.name}.`);
	}
	const elapsedInsideClip = Math.max(0, projectOffset - clip.timelineStart);
	const playableDuration = Math.max(0, clip.duration - elapsedInsideClip);
	if (playableDuration <= 0) {
		return null;
	}
	const source = context.createBufferSource();
	const gain = context.createGain();
	source.buffer = buffer;
	gain.gain.value = clip.gain;
	source.connect(gain);
	gain.connect(trackOutput);
	const sourceOffset = clip.sourceOffset + elapsedInsideClip;
	if (clip.loop) {
		source.loop = true;
		source.loopStart = clip.sourceOffset;
		source.loopEnd = Math.min(buffer.duration, clip.sourceOffset + clip.duration);
	}
	source.start(when, sourceOffset, playableDuration);
	return {
		source,
		gain,
		stop: () => safeStop(source)
	};
}

function safeStop(source) {
	try {
		source.stop();
	} catch (_error) {
		// Already stopped sources are harmless; the Awtsmoos leaves no orphaned voice.
	}
	try {
		source.disconnect();
	} catch (_error) {
		// Disconnection is best-effort after natural source completion.
	}
}
