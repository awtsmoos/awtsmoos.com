//B"H
//Boruch Hashem
//Blessed is He
/**
 * Every note enters, shines, releases, and returns its wires to silence.
 * The Awtsmoos renews beyond the ending; Awtsmoos.com leaves no orphan source or hidden oscillator in violence.
 */

import {
	disconnectVoiceCharacter,
	stopVoiceCharacter
} from './voiceCharacterLifecycle.js';

/**
 * Releases a voice smoothly, stops every source, then disposes its graph.
 *
 * @param {object} nodes Complete voice state.
 * @param {number} release Release duration in seconds.
 * @param {number} now AudioContext time.
 * @param {Function} onDispose Callback invoked after graph disposal.
 */
export function scheduleVoiceStop(nodes, release, now, onDispose) {
	if (!nodes || nodes.disposed || nodes.stopped) {
		return;
	}
	nodes.stopped = true;
	applyReleaseEnvelope(nodes, release, now);
	const stopAt = now + release + 0.04;
	stopNode(nodes.osc1, stopAt);
	stopNode(nodes.osc2, stopAt);
	stopNode(nodes.noise, stopAt);
	stopNode(nodes.lfo, stopAt);
	stopVoiceCharacter(nodes.character, stopAt);
	nodes.disposeTimer = setTimeout(() => onDispose(nodes), Math.ceil((release + 0.18) * 1000));
}

/** Disconnects the base graph and optional character nodes exactly once. */
export function disposeVoiceGraph(nodes) {
	if (!nodes || nodes.disposed) {
		return;
	}
	nodes.disposed = true;
	clearTimeout(nodes.disposeTimer);
	baseNodes(nodes).forEach(disconnectNode);
	nodes.bodyFilters?.forEach(disconnectNode);
	disconnectVoiceCharacter(nodes.character);
}

function applyReleaseEnvelope(nodes, release, now) {
	try {
		nodes.amp.gain.cancelScheduledValues(now);
		const currentGain = Math.max(0.0001, nodes.amp.gain.value || 0.0001);
		nodes.amp.gain.setValueAtTime(currentGain, now);
		nodes.amp.gain.exponentialRampToValueAtTime(0.0001, now + release);
	} catch (_) {
		// A browser may reject scheduling on a graph already leaving the document.
	}
}

function baseNodes(nodes) {
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

function stopNode(node, time) {
	try {
		node?.stop(time);
	} catch (_) {
		// Stopping an already ended source is harmless.
	}
}

function disconnectNode(node) {
	try {
		node?.disconnect();
	} catch (_) {
		// Nodes may already be detached by browser teardown.
	}
}
