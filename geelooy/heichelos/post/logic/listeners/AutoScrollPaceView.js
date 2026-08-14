// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollPaceView
 * @description The Awtsmoos synchronizes unit, preset, pace, eye line, density,
 * and estimate controls from one measured semantic state rather than DOM memory.
 */
import {
	EYE_LINE_RANGE,
	PACE_RANGES
} from '../../actions/autoScroll/SemanticPacePolicy.js';

function updateRange(range, state) {
	const policy = PACE_RANGES[state.unit];
	range.min = String(policy.min);
	range.max = String(policy.max);
	range.step = String(policy.step);
	range.value = String(state.value);
	range.setAttribute('aria-valuenow', String(state.value));
	range.setAttribute('aria-valuetext', state.paceText);
}

function updateEyeLine(range, state) {
	range.min = String(EYE_LINE_RANGE.min);
	range.max = String(EYE_LINE_RANGE.max);
	range.step = String(EYE_LINE_RANGE.step);
	range.value = String(state.eyeLine);
	range.setAttribute('aria-valuenow', String(state.eyeLine));
	range.setAttribute('aria-valuetext', `${Math.round(state.eyeLine * 100)} percent`);
}

export function renderAutoScrollPaceControls(state) {
	const paceRange = document.getElementById('autoScrollPaceRange');
	const eyeLineRange = document.getElementById('autoScrollEyeLineRange');
	if (paceRange) {
		updateRange(paceRange, state);
	}
	if (eyeLineRange) {
		updateEyeLine(eyeLineRange, state);
	}
	for (const button of document.querySelectorAll('[data-auto-scroll-unit]')) {
		button.setAttribute('aria-pressed', String(button.dataset.autoScrollUnit === state.unit));
	}
	for (const button of document.querySelectorAll('[data-auto-scroll-preset]')) {
		button.setAttribute('aria-pressed', String(button.dataset.autoScrollPreset === state.preset));
	}
	const pace = document.getElementById('autoScrollPaceDisplay');
	const estimate = document.getElementById('autoScrollEstimateDisplay');
	const density = document.getElementById('autoScrollDensityDisplay');
	const eye = document.getElementById('autoScrollEyeLineDisplay');
	if (pace) pace.textContent = state.text;
	if (estimate) estimate.textContent = state.estimateText;
	if (eye) eye.textContent = `${Math.round(state.eyeLine * 100)}%`;
	if (density) {
		const words = state.metrics?.readingWordCount ?? 0;
		const lines = Math.round(state.metrics?.lineCount ?? 0);
		density.textContent = words ? `${words} Hebrew reading words · ${lines} lines` : 'Measuring reader…';
	}
}
