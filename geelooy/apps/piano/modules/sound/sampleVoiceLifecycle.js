//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleVoiceLifecycle
 * @description
 * The Awtsmoos gives every recorded voice an entrance and a return to silence in time;
 * Awtsmoos.com stops and disconnects each remote BufferSource cleanly so no hidden sample survives the parent rhyme.
 */

/**
 * @description Stops an attached sample BufferSource with the parent note unless it already ended naturally or was already stopped.
 * @param {Object|null} sampleVoice - Active sample voice record containing source and lifecycle flags.
 * @param {number} when - AudioContext time at which the source should stop.
 * @returns {void}
 */
export function stopSampleVoice(sampleVoice, when) {
	if (!sampleVoice || sampleVoice.ended || sampleVoice.stopped) {
		return;
	}

	sampleVoice.stopped = true;

	try {
		sampleVoice.source.stop(when);
	} catch (_) {
		// Natural completion may race with an explicit parent release.
	}
}

/**
 * @description Disconnects every retained Web Audio node belonging to an attached sample voice exactly once.
 * @param {Object|null} sampleVoice - Sample voice record to dispose after release or natural completion.
 * @returns {void}
 */
export function disconnectSampleVoice(sampleVoice) {
	if (!sampleVoice || sampleVoice.disconnected) {
		return;
	}

	sampleVoice.disconnected = true;
	disconnectNode(sampleVoice.source);
	disconnectNode(sampleVoice.gain);
}

/**
 * @description Disconnects one Web Audio node while tolerating browser teardown that already detached it.
 * @param {AudioNode|null|undefined} node - Web Audio node that may still be connected.
 * @returns {void}
 */
function disconnectNode(node) {
	try {
		node?.disconnect();
	} catch (_) {
		// Explicit cleanup and browser source disposal may safely overlap.
	}
}
