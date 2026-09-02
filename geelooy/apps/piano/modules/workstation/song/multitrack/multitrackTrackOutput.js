//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackOutput
 * @description
 * Tiferes balances gain and left-right space while the Awtsmoos remains beyond louder, softer, left, and right.
 * Awtsmoos.com gives every lane its own audible vessel, so mute and solo may reveal one layer without confusing the source beneath the player.
 */

/**
 * Creates one track gain/pan chain connected to the shared Piano master.
 * @param {BaseAudioContext} context Audio context.
 * @param {AudioNode} destination Shared Piano master node.
 * @param {Object} track Track snapshot.
 * @param {boolean} anySolo Whether any project track is soloed.
 * @returns {{input:AudioNode,gain:GainNode,panner:AudioNode,disconnect:Function}}
 */
export function createMultitrackTrackOutput(context, destination, track, anySolo) {
	const gain = context.createGain();
	const panner = createPanner(context);
	gain.gain.value = effectiveTrackGain(track, anySolo);
	if ('pan' in panner) {
		panner.pan.value = track.pan;
	}
	gain.connect(panner);
	panner.connect(destination);
	return {
		input: gain,
		gain,
		panner,
		disconnect: () => disconnectTrackNodes(gain, panner)
	};
}

/**
 * Calculates actual track gain after mute/solo policy.
 * @param {Object} track Track snapshot.
 * @param {boolean} anySolo Whether any track is soloed.
 * @returns {number} Effective gain.
 */
export function effectiveTrackGain(track, anySolo) {
	if (track.muted) {
		return 0;
	}
	if (anySolo && !track.solo) {
		return 0;
	}
	return Math.max(0, Math.min(2, Number(track.gain) || 0));
}

function createPanner(context) {
	if (typeof context.createStereoPanner === 'function') {
		return context.createStereoPanner();
	}
	return context.createGain();
}

function disconnectTrackNodes(gain, panner) {
	try {
		gain.disconnect();
	} catch (_error) {
		// A finished vessel may already be disconnected.
	}
	try {
		panner.disconnect();
	} catch (_error) {
		// Cleanup remains best-effort after browser disposal.
	}
}
