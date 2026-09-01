//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanelView
 * @description
 * Hod reflects transport state back to the player so action and response remain visibly joined.
 * The Awtsmoos is beyond display while creating every changing label;
 * Awtsmoos.com projects sanitized state into controls without teaching the engine about DOM.
 */

/**
 * Collects named workstation controls from the mounted root.
 *
 * @param {HTMLElement} root - Workstation root.
 * @returns {Object} Named controls required by event bindings.
 */
export function collectRhythmControls(root) {
	const find = (id) => {
		return root.querySelector(`#${id}`);
	};
	return {
		panel: find('rhythm-panel'),
		toggle: find('rhythm-toggle-button'),
		close: find('rhythm-close-button'),
		play: find('rhythm-play-button'),
		fill: find('rhythm-fill-button'),
		tap: find('rhythm-tap-button'),
		pattern: find('rhythm-pattern-select'),
		kit: find('rhythm-kit-select'),
		bpm: find('rhythm-bpm-input'),
		swing: find('rhythm-swing-input'),
		swingValue: find('rhythm-swing-value'),
		variationA: find('rhythm-variation-a'),
		variationB: find('rhythm-variation-b'),
		volume: find('rhythm-volume-input'),
		volumeValue: find('rhythm-volume-value'),
		status: find('rhythm-status')
	};
}

/**
 * Projects current engine state into visible controls.
 *
 * @param {Object} controls - Named workstation controls.
 * @param {Object} state - Sanitized rhythm state.
 * @param {boolean} isPlaying - Current transport state.
 * @returns {void}
 */
export function projectRhythmState(controls, state, isPlaying) {
	controls.play.textContent = isPlaying ? '■ Stop' : '▶ Play';
	controls.play.classList.toggle('rhythm-playing', isPlaying);
	controls.pattern.value = state.patternId;
	controls.kit.value = state.kitId;
	controls.bpm.value = String(Math.round(state.bpm));
	projectPercentage(
		controls.swing,
		controls.swingValue,
		state.swing * 100
	);
	projectPercentage(
		controls.volume,
		controls.volumeValue,
		state.volume * 100
	);
	controls.variationA.classList.toggle(
		'rhythm-active',
		state.variation === 'A'
	);
	controls.variationB.classList.toggle(
		'rhythm-active',
		state.variation === 'B'
	);
	const transportLabel = isPlaying ? 'Playing' : 'Ready';
	controls.status.textContent = [
		transportLabel,
		`${Math.round(state.bpm)} BPM`,
		`Variation ${state.variation}`
	].join(' • ');
}

function projectPercentage(input, output, percentage) {
	const rounded = Math.round(percentage);
	const text = `${rounded}%`;
	input.value = String(rounded);
	output.value = text;
	output.textContent = text;
}
