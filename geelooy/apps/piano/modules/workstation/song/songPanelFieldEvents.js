//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelFieldEvents
 * @description
 * Yesod carries editor gestures into state while preserving the raw musical vessel beneath every temporary choice.
 * The Awtsmoos is beyond field and value; Awtsmoos.com lets each control speak one clear language so the remix may grow without hidden change below.
 */

import { ratchetPresetOptions } from './songRatchet.js';

const NUMERIC_RATCHET_FIELDS = new Set([
	'sliceStart',
	'sliceLength',
	'repetitions',
	'shortenRatio',
	'minimumSlice',
	'velocityRamp',
	'gate',
	'gapAfter'
]);

/**
 * Binds Song editor text and control fields into the shared studio state.
 *
 * @param {Object} dom Song Studio DOM registry.
 * @param {Object} state Song Studio state.
 * @param {Function} onPresetApplied Callback used to redraw preset-controlled values.
 * @returns {void}
 */
export function bindSongFieldEvents(dom, state, onPresetApplied = () => {}) {
	dom.editor.addEventListener('input', () => {
		state.setEditorText(dom.editor.value);
	});
	dom.fields.forEach((field, name) => {
		field.addEventListener('change', () => {
			handleFieldChange(name, field.value, state, onPresetApplied);
		});
	});
}

function handleFieldChange(name, value, state, onPresetApplied) {
	if (name === 'tempo') {
		state.tempo = positiveNumber(value, state.tempo);
		return;
	}
	if (name === 'grid') {
		state.grid = positiveNumber(value, state.grid);
		return;
	}
	if (name === 'remixStyle') {
		state.remixStyle = String(value);
		return;
	}
	if (name === 'seed') {
		state.seed = String(value);
		return;
	}
	if (name === 'ratchetPreset') {
		applyRatchetPreset(state, String(value));
		onPresetApplied();
		return;
	}
	if (NUMERIC_RATCHET_FIELDS.has(name)) {
		state.ratchet[name] = finiteNumber(value, state.ratchet[name]);
	}
}

/**
 * Applies one named ratchet character without erasing slice or drop placement choices.
 *
 * @param {Object} state Song Studio state.
 * @param {string} presetId Preset id.
 * @returns {void}
 */
export function applyRatchetPreset(state, presetId) {
	const preset = ratchetPresetOptions(presetId);
	state.ratchet = {
		...state.ratchet,
		preset: presetId,
		repetitions: preset.repetitions,
		shortenRatio: preset.shortenRatio,
		velocityRamp: preset.velocityRamp,
		gate: preset.gate
	};
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
