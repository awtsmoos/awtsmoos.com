//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVoiceLifecycle
 * @description
 * Every note enters, shines, releases, and returns its wires to silence while the Awtsmoos renews beyond the ending;
 * Awtsmoos.com now returns procedural sources, character layers, and remote samples together so no orphan voice remains pretending.
 */

import {
	disconnectVoiceCharacter,
	stopVoiceCharacter
} from './voiceCharacterLifecycle.js';
import {
	disconnectSampleVoice,
	stopSampleVoice
} from './sampleVoiceLifecycle.js';
import {
	baseVoiceNodes,
	disconnectVoiceNode,
	stopVoiceNode
} from './voiceNodeCleanup.js';

/**
 * @description Applies the release envelope, stops every owned scheduled source, and schedules deterministic graph disposal after the audible tail.
 * @param {Object} nodes - Complete voice state containing base, character, and optional sample nodes.
 * @param {number} release - Release duration in seconds.
 * @param {number} now - Current AudioContext time.
 * @param {Function} onDispose - Callback that performs final graph disposal after release.
 * @returns {void}
 */
export function scheduleVoiceStop(nodes, release, now, onDispose) {
	if (!nodes || nodes.disposed || nodes.stopped) {
		return;
	}

	nodes.stopped = true;
	applyReleaseEnvelope(nodes, release, now);

	const stopAt = now + release + 0.04;
	stopVoiceNode(nodes.osc1, stopAt);
	stopVoiceNode(nodes.osc2, stopAt);
	stopVoiceNode(nodes.noise, stopAt);
	stopVoiceNode(nodes.lfo, stopAt);
	stopVoiceCharacter(nodes.character, stopAt);
	stopSampleVoice(nodes.sampleVoice, stopAt);

	const disposeDelayMs = Math.ceil((release + 0.18) * 1000);
	nodes.disposeTimer = setTimeout(() => {
		onDispose(nodes);
	}, disposeDelayMs);
}

/**
 * @description Disconnects every base, body, character, and remote-sample node exactly once after release or panic cleanup.
 * @param {Object} nodes - Complete voice record to dispose.
 * @returns {void}
 */
export function disposeVoiceGraph(nodes) {
	if (!nodes || nodes.disposed) {
		return;
	}

	nodes.disposed = true;
	clearTimeout(nodes.disposeTimer);
	baseVoiceNodes(nodes).forEach(disconnectVoiceNode);
	nodes.bodyFilters?.forEach(disconnectVoiceNode);
	disconnectVoiceCharacter(nodes.character);
	disconnectSampleVoice(nodes.sampleVoice);
}

/**
 * @description Replaces pending amplitude automation with an exponential fade from the currently observed gain to a near-silent floor.
 * @param {Object} nodes - Voice record containing the amplitude GainNode.
 * @param {number} release - Release duration in seconds.
 * @param {number} now - Current AudioContext time.
 * @returns {void}
 */
function applyReleaseEnvelope(nodes, release, now) {
	try {
		nodes.amp.gain.cancelScheduledValues(now);
		const currentGain = Math.max(0.0001, nodes.amp.gain.value || 0.0001);
		nodes.amp.gain.setValueAtTime(currentGain, now);
		nodes.amp.gain.exponentialRampToValueAtTime(0.0001, now + release);
	} catch (_) {
		// A browser may reject automation on a graph already leaving the document.
	}
}
