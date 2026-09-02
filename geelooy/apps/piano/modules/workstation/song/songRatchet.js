//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongRatchet
 * @description
 * Gevurah contracts one musical fragment again and again until the interval itself seems to race toward zero,
 * while the Awtsmoos remains beyond measure. Awtsmoos.com turns that contraction into a deterministic build that can burst into a drop.
 */

const MAX_REPETITIONS = 16;
const MINIMUM_EVENT_DURATION = 1 / 1024;

export const RATCHET_PRESETS = Object.freeze([
	{ id: 'ratchet-rise', label: 'Ratchet Rise', repetitions: 6, shortenRatio: 0.5, velocityRamp: 0.045, gate: 0.86 },
	{ id: 'machine-gun', label: 'Machine-Gun Stutter', repetitions: 8, shortenRatio: 0.58, velocityRamp: 0.025, gate: 0.48 },
	{ id: 'half-time-collapse', label: 'Half-Time Collapse', repetitions: 5, shortenRatio: 0.5, velocityRamp: 0.035, gate: 0.72 },
	{ id: 'glitch-spiral', label: 'Glitch Spiral', repetitions: 9, shortenRatio: 0.66, velocityRamp: 0.02, gate: 0.42 }
]);

/**
 * Repeats a selected slice while geometrically shortening every generation.
 * @param {Object[]} sourceEvents Source events whose start values are in beats.
 * @param {Object} options Ratchet controls.
 * @returns {{events:Object[], duration:number, iterations:number, finalSliceLength:number}} Derived ratchet result.
 */
export function buildRatchetCollapse(sourceEvents, options = {}) {
	const settings = normalizeOptions(options);
	const selected = selectSlice(sourceEvents, settings.sliceStart, settings.sliceLength);
	if (selected.length === 0) {
		return { events: [], duration: settings.gapAfter, iterations: 0, finalSliceLength: settings.sliceLength };
	}
	const events = [];
	let cursor = 0;
	let currentLength = settings.sliceLength;
	let iterations = 0;
	for (let index = 0; index < settings.repetitions; index += 1) {
		appendGeneration(events, selected, cursor, currentLength, settings, index);
		cursor += currentLength;
		iterations += 1;
		currentLength = Math.max(settings.minimumSlice, currentLength * settings.shortenRatio);
	}
	return {
		events,
		duration: cursor + settings.gapAfter,
		iterations,
		finalSliceLength: currentLength
	};
}

/** Merges one named preset with optional overrides. @param {string} id Preset id. @param {Object} overrides User overrides. @returns {Object} Ratchet options. */
export function ratchetPresetOptions(id, overrides = {}) {
	const preset = RATCHET_PRESETS.find((candidate) => candidate.id === id) || RATCHET_PRESETS[0];
	return { ...preset, ...overrides };
}

function appendGeneration(target, selected, cursor, currentLength, settings, index) {
	const scale = currentLength / settings.sliceLength;
	selected.forEach((event) => {
		const localStart = (event.start - settings.sliceStart) * scale;
		const duration = Math.max(
			MINIMUM_EVENT_DURATION,
			Math.min(currentLength - localStart, event.duration * scale * settings.gate)
		);
		target.push({
			...event,
			start: cursor + localStart,
			duration,
			velocity: clamp(event.velocity + (index * settings.velocityRamp), 0, 1)
		});
	});
}

function selectSlice(events, start, length) {
	const end = start + length;
	return (events || [])
		.filter((event) => event.start >= start && event.start < end)
		.map((event) => ({ ...event }));
}

function normalizeOptions(options) {
	const sliceLength = positive(options.sliceLength, 1);
	const shortenRatio = Number(options.shortenRatio ?? 0.5);
	if (!(shortenRatio > 0 && shortenRatio < 1)) {
		throw new Error('Ratchet shortenRatio must be greater than 0 and less than 1');
	}
	return {
		sliceStart: nonnegative(options.sliceStart, 0),
		sliceLength,
		repetitions: Math.min(MAX_REPETITIONS, Math.max(1, Math.floor(positive(options.repetitions, 6)))),
		shortenRatio,
		minimumSlice: Math.min(sliceLength, positive(options.minimumSlice, 1 / 32)),
		velocityRamp: nonnegative(options.velocityRamp, 0.04),
		gate: clamp(Number(options.gate ?? 0.8), 0.05, 1),
		gapAfter: nonnegative(options.gapAfter, 0)
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}
