// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SemanticPacePolicy
 * @description
 * The Awtsmoos gives the reader a pace that may truly whisper or swiftly flow;
 * at Awtsmoos.com contemplation begins softly, while review may freely grow.
 * WPM and LPM share one law so sparse pages cannot force every soul to race,
 * and each preset remains an explicit vessel for a chosen learning pace.
 */
import { finiteNumber, roundedToStep } from './SemanticPaceNumbers.js';

export const WPM_UNIT = 'wpm';
export const LPM_UNIT = 'lpm';
export const CUSTOM_PRESET = 'custom';
export const PACE_RANGES = Object.freeze({
	[WPM_UNIT]: Object.freeze({ min: 10, max: 400, step: 1 }),
	[LPM_UNIT]: Object.freeze({ min: 0.25, max: 16, step: 0.25 })
});
export const EYE_LINE_RANGE = Object.freeze({ min: 0.3, max: 0.65, step: 0.05 });
export const SEMANTIC_PRESETS = Object.freeze({
	contemplate: Object.freeze({ label: 'Contemplate', wpm: 45, lpm: 1.25, pauseScale: 1.6 }),
	learn: Object.freeze({ label: 'Learn', wpm: 95, lpm: 3.25, pauseScale: 1 }),
	review: Object.freeze({ label: 'Review', wpm: 190, lpm: 6.5, pauseScale: 0.7 }),
	scan: Object.freeze({ label: 'Scan', wpm: 340, lpm: 12, pauseScale: 0.35 })
});
export const DEFAULT_SEMANTIC_PREFERENCES = Object.freeze({
	unit: WPM_UNIT,
	value: SEMANTIC_PRESETS.contemplate.wpm,
	preset: 'contemplate',
	eyeLine: 0.4
});

/** @returns {'wpm'|'lpm'} A supported semantic pace unit. */
export function normalizePaceUnit(unit) {
	return unit === LPM_UNIT ? LPM_UNIT : WPM_UNIT;
}

/** @returns {{min:number,max:number,step:number}} Range for one semantic unit. */
export function paceRange(unit) {
	return PACE_RANGES[normalizePaceUnit(unit)];
}

/** @returns {number} A pace clamped to its semantic control range. */
export function clampPaceValue(value, unit = WPM_UNIT) {
	const normalizedUnit = normalizePaceUnit(unit);
	const range = PACE_RANGES[normalizedUnit];
	const fallback = DEFAULT_SEMANTIC_PREFERENCES.unit === normalizedUnit
		? DEFAULT_SEMANTIC_PREFERENCES.value
		: SEMANTIC_PRESETS.contemplate[normalizedUnit];
	const rounded = roundedToStep(finiteNumber(value, fallback), range.step);
	return Math.min(range.max, Math.max(range.min, rounded));
}

/** @returns {number} A stable eye-line ratio. */
export function clampEyeLine(value) {
	const fallback = DEFAULT_SEMANTIC_PREFERENCES.eyeLine;
	const rounded = roundedToStep(finiteNumber(value, fallback), EYE_LINE_RANGE.step);
	return Math.min(EYE_LINE_RANGE.max, Math.max(EYE_LINE_RANGE.min, rounded));
}

/** @returns {{unit:string,value:number,preset:string,eyeLine:number}} Normalized preferences. */
export function normalizeSemanticPreferences(value = {}) {
	const unit = normalizePaceUnit(value.unit);
	const preset = Object.hasOwn(SEMANTIC_PRESETS, value.preset) ? value.preset : CUSTOM_PRESET;
	return { unit, value: clampPaceValue(value.value, unit), preset, eyeLine: clampEyeLine(value.eyeLine) };
}

/** @returns {object} Preferences matching one named preset. */
export function preferencesForPreset(name, unit = WPM_UNIT, eyeLine = 0.4) {
	const normalizedUnit = normalizePaceUnit(unit);
	const chosenName = Object.hasOwn(SEMANTIC_PRESETS, name) ? name : 'contemplate';
	const preset = SEMANTIC_PRESETS[chosenName];
	return normalizeSemanticPreferences({
		unit: normalizedUnit,
		value: preset[normalizedUnit],
		preset: chosenName,
		eyeLine
	});
}

/** @returns {number} Boundary-pause scaling for a semantic preset. */
export function pauseScaleForPreferences(preferences) {
	return SEMANTIC_PRESETS[preferences?.preset]?.pauseScale ?? 1;
}

/** @returns {object} Semantic preferences converted from the legacy multiplier. */
export function legacySpeedToPreferences(speed) {
	const wpm = clampPaceValue(finiteNumber(speed, 0.14) * 320, WPM_UNIT);
	const preset = wpm === SEMANTIC_PRESETS.contemplate.wpm ? 'contemplate' : CUSTOM_PRESET;
	return normalizeSemanticPreferences({ unit: WPM_UNIT, value: wpm, preset, eyeLine: 0.4 });
}

/** @returns {number} Legacy multiplier for compatibility consumers. */
export function preferencesToLegacySpeed(preferences) {
	const normalized = normalizeSemanticPreferences(preferences);
	const wpm = normalized.unit === WPM_UNIT ? normalized.value : normalized.value * 30;
	return Math.max(0.03, Math.min(8, Number((wpm / 320).toFixed(3))));
}

/** @returns {object} Human-readable pace summary for controls and accessibility. */
export function describeSemanticPace(preferences, pixelsPerSecond = 0) {
	const normalized = normalizeSemanticPreferences(preferences);
	const presetLabel = SEMANTIC_PRESETS[normalized.preset]?.label ?? 'Custom';
	const paceText = `${normalized.value} ${normalized.unit.toUpperCase()}`;
	const flow = Number.isFinite(pixelsPerSecond) ? Math.round(pixelsPerSecond) : 0;
	return { ...normalized, presetLabel, paceText, text: `${paceText} · ${presetLabel} · ${flow} px/s`, speed: preferencesToLegacySpeed(normalized) };
}
