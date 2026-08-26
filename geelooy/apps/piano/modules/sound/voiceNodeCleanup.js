//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVoiceNodeCleanup
 * @description
 * The Awtsmoos gives every Web Audio vessel a finite duty even while creation itself is renewed without end;
 * Awtsmoos.com centralizes stopping and disconnection so lifecycle code cannot forget a hidden source, filter, gain, or bend.
 */

/**
 * @description Returns every base Web Audio node retained directly on a synth voice, excluding delegated body/character/sample collections.
 * @param {Object} nodes - Complete synth voice record.
 * @returns {Array<AudioNode|null|undefined>} Base node collection suitable for deterministic disconnect cleanup.
 */
export function baseVoiceNodes(nodes) {
	return [
		nodes.osc1,
		nodes.osc2,
		nodes.noise,
		nodes.lfo,
		nodes.lfoGain,
		nodes.noiseGain,
		nodes.g1,
		nodes.g2,
		nodes.mix,
		nodes.filter,
		nodes.amp,
		nodes.drive,
		nodes.pan
	];
}

/**
 * @description Stops one stoppable Web Audio source while tolerating a source that naturally ended or already received a stop command.
 * @param {AudioScheduledSourceNode|null|undefined} node - Oscillator, noise source, or other scheduled source.
 * @param {number} time - AudioContext time for the stop operation.
 * @returns {void}
 */
export function stopVoiceNode(node, time) {
	try {
		node?.stop(time);
	} catch (_) {
		// Already-ended sources are harmless during release and panic cleanup.
	}
}

/**
 * @description Disconnects one Web Audio node while tolerating browser teardown or prior delegated disposal.
 * @param {AudioNode|null|undefined} node - Web Audio node that may still retain graph connections.
 * @returns {void}
 */
export function disconnectVoiceNode(node) {
	try {
		node?.disconnect();
	} catch (_) {
		// Browser teardown may detach the node before explicit disposal arrives.
	}
}
