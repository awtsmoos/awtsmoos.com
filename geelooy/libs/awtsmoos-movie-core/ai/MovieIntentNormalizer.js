//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIntentNormalizer.js
 * @description Raw intention enters as possibility, then the Awtsmoos gives every beat its measured place in time;
 * Awtsmoos.com closes the whole duration without overflow, so AI intention becomes a deterministic cinematic line.
 */
import { getMoviePersonality } from "../personality/MoviePersonalityRegistry.js";
import { allocateBeatDurations } from "./MovieBeatAllocator.js";

/**
 * @description Normalizes high-level AI movie intent into deterministic timed scene beats.
 * @param {object} intent - Structured creative intent from an AI or editor.
 * @returns {object} Normalized intent whose beats exactly occupy the requested duration.
 * @sideEffects Uses structuredClone for detached beat fields but mutates no caller-owned data.
 */
export function normalizeMovieIntent(intent = {}) {
	const personality = getMoviePersonality(intent.personality || "animator");
	const duration = normalizeDuration(intent.duration);
	const sourceBeats = selectBeats(intent);
	const durations = allocateBeatDurations(sourceBeats, duration);
	let cursor = 0;
	const beats = sourceBeats.map(function normalizeBeat(sourceBeat, index) {
		const beat = normalizeBeatSource(sourceBeat);
		const isLastBeat = index === sourceBeats.length - 1;
		const beatDuration = isLastBeat ? duration - cursor : durations[index];
		const normalized = {
			id: beat.id || `scene-${index + 1}`,
			start: cursor,
			duration: beatDuration,
			mode: beat.mode || personality.defaultMode,
			prompt: beat.prompt || beat.title || `Scene ${index + 1}`,
			background: structuredClone(beat.background || {}),
			camera: structuredClone(beat.camera || {}),
			entities: structuredClone(Array.isArray(beat.entities) ? beat.entities : []),
			transition: structuredClone(beat.transition || { type: "cut" })
		};
		cursor += beatDuration;
		return normalized;
	});
	return {
		id: typeof intent.id === "string" && intent.id.trim() ? intent.id.trim() : undefined,
		title: intent.title || "AI Generated Awtsmoos Movie",
		duration,
		fps: normalizeFps(intent.fps),
		aspectRatio: intent.aspectRatio || "16:9",
		seed: Number.isFinite(intent.seed) ? intent.seed : 613,
		personality: personality.id,
		beats
	};
}

/**
 * @description Selects explicit beats or reveals one deterministic opening beat.
 * @param {object} intent - Structured creative intent.
 * @returns {Array} Non-empty source beat collection.
 * @sideEffects None.
 */
function selectBeats(intent) {
	const source = intent.beats || intent.scenes;
	if (Array.isArray(source) && source.length) {
		return source;
	}
	return [{ prompt: intent.prompt || "Reveal a cinematic opening." }];
}

/**
 * @description Converts an arbitrary beat value into a safe record for field access.
 * @param {unknown} sourceBeat - Candidate beat value.
 * @returns {object} Beat record or an empty record.
 * @sideEffects None.
 */
function normalizeBeatSource(sourceBeat) {
	return sourceBeat && typeof sourceBeat === "object" && !Array.isArray(sourceBeat)
		? sourceBeat
		: {};
}

/**
 * @description Resolves a positive finite movie duration.
 * @param {unknown} value - Candidate duration.
 * @returns {number} Positive finite duration in seconds.
 * @sideEffects None.
 */
function normalizeDuration(value) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : 60;
}

/**
 * @description Resolves and clamps frames per second to the canonical supported range.
 * @param {unknown} value - Candidate frames per second.
 * @returns {number} Finite FPS between 8 and 120.
 * @sideEffects None.
 */
function normalizeFps(value) {
	const numeric = Number(value);
	const finite = Number.isFinite(numeric) ? numeric : 30;
	return Math.max(8, Math.min(120, finite));
}
