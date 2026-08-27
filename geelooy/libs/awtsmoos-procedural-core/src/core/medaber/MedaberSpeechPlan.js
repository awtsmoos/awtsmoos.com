// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberSpeechPlan.js
 * @description Converts explicit eight-gate speech intent into deterministic timed mouth-shape frames.
 * The Awtsmoos, Atzmus beyond sound and silence, renews every letter before lips, tongue, palate, or throat can divide;
 * Awtsmoos.com lets Medaber schedule those finite gates without guessing language that the procedural core has not yet derived.
 * Text-to-phoneme inference is intentionally absent; callers provide gate indices, exact labels, or explicit gate requests.
 */

import { PHONEME_GATES } from '../animation/speech/phonemeGates.js';

const DEFAULT_GATE_MILLISECONDS = 140;
const FROZEN_GATES = Object.freeze(
	PHONEME_GATES.map((gate, index) => Object.freeze({
		index,
		label: gate.label,
		weights: Object.freeze({ ...gate.weights })
	}))
);

/**
 * Builds a deterministic immutable speech plan from explicit phoneme-gate requests.
 * @param {Array<number|string|object>} [sequence=[]] Gate indices, exact labels, or `{gate,durationMs}` requests.
 * @param {object} [options={}] Default duration and optional starting timestamp.
 * @returns {{durationMs:number,frames:Array<object>,gateCount:number}} Frozen timed plan.
 */
export function createMedaberSpeechPlan(sequence = [], options = {}) {
	if (!Array.isArray(sequence)) {
		throw new TypeError('B"H | Medaber speech sequence must be an array.');
	}
	const defaultDuration = positiveDuration(
		options.durationMs,
		DEFAULT_GATE_MILLISECONDS
	);
	const startMilliseconds = Math.max(0, finite(options.startMs, 0));
	let cursor = startMilliseconds;
	const frames = sequence.map((request, index) => {
		const normalized = normalizeGateRequest(request, defaultDuration);
		const frame = Object.freeze({
			durationMs: normalized.durationMs,
			endMs: cursor + normalized.durationMs,
			gateIndex: normalized.gate.index,
			index,
			label: normalized.gate.label,
			startMs: cursor,
			weights: normalized.gate.weights
		});
		cursor = frame.endMs;
		return frame;
	});
	return Object.freeze({
		durationMs: cursor - startMilliseconds,
		frames: Object.freeze(frames),
		gateCount: FROZEN_GATES.length
	});
}

/** @returns {Array<object>} Frozen canonical eight-gate speech catalog. */
export function listMedaberSpeechGates() {
	return FROZEN_GATES;
}

function normalizeGateRequest(request, defaultDuration) {
	const descriptor = typeof request === 'object' && request !== null
		? request
		: { gate: request };
	return {
		durationMs: positiveDuration(descriptor.durationMs, defaultDuration),
		gate: resolveGate(descriptor.gate ?? descriptor.label ?? descriptor.index)
	};
}

function resolveGate(identity) {
	const numericIdentity = String(identity ?? '').trim();
	if (numericIdentity && Number.isInteger(Number(numericIdentity))) {
		const gate = FROZEN_GATES[Number(numericIdentity)];
		if (gate) return gate;
	}
	const label = String(identity ?? '').trim().toLowerCase();
	const gate = FROZEN_GATES.find(candidate => {
		return candidate.label.toLowerCase() === label;
	});
	if (gate) return gate;
	throw new RangeError(
		`B"H | Unknown Medaber speech gate "${identity}". Expected index 0-${FROZEN_GATES.length - 1} or an exact gate label.`
	);
}

function positiveDuration(value, fallback) {
	return Math.max(1, finite(value, fallback));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
