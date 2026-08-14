// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollSemanticControls
 * @description
 * The Awtsmoos replaces a legacy multiplier row with explicit semantic controls and no raw HTML sink;
 * at Awtsmoos.com every label, estimate, range, and preset is built as a visible DOM vessel.
 */
const PRESETS = [
	['contemplate', 'Contemplate'],
	['learn', 'Learn'],
	['review', 'Review'],
	['scan', 'Scan']
];

function button(label, dataName, value) {
	const element = document.createElement('button');
	element.type = 'button';
	element.textContent = label;
	element.setAttribute('aria-pressed', 'false');
	element.dataset[dataName] = value;
	return element;
}

function rangeRow(label, id, outputId) {
	const row = document.createElement('label');
	row.className = 'auto-scroll-semantic-range';
	const heading = document.createElement('span');
	heading.textContent = label;
	const output = document.createElement('output');
	output.id = outputId;
	const range = document.createElement('input');
	range.id = id;
	range.type = 'range';
	range.dataset.autoScrollControl = 'true';
	range.setAttribute('aria-describedby', outputId);
	row.append(heading, output, range);
	return row;
}

function summary() {
	const vessel = document.createElement('div');
	vessel.className = 'auto-scroll-semantic-summary';
	const estimate = document.createElement('span');
	estimate.id = 'autoScrollEstimateDisplay';
	estimate.textContent = 'Calculating…';
	const density = document.createElement('small');
	density.id = 'autoScrollDensityDisplay';
	density.textContent = 'Measuring reader…';
	vessel.append(estimate, density);
	return vessel;
}

export function ensureAutoScrollSemanticControls() {
	const existing = document.getElementById('autoScrollSemanticControls');
	if (existing) {
		return existing;
	}
	const card = document.querySelector('.auto-scroll-settings');
	if (!card) {
		return null;
	}
	card.querySelector('.speed-control-row')?.remove();
	card.querySelector('.speed-readout-row')?.remove();
	card.querySelector('.auto-scroll-help')?.remove();
	const root = document.createElement('div');
	root.id = 'autoScrollSemanticControls';
	root.className = 'auto-scroll-semantic-controls';
	root.dataset.autoScrollControl = 'true';
	const units = document.createElement('div');
	units.className = 'auto-scroll-unit-switch';
	units.setAttribute('role', 'group');
	units.setAttribute('aria-label', 'Pace unit');
	units.append(
		button('Words / min', 'autoScrollUnit', 'wpm'),
		button('Lines / min', 'autoScrollUnit', 'lpm')
	);
	const presets = document.createElement('div');
	presets.className = 'auto-scroll-presets';
	presets.setAttribute('role', 'group');
	presets.setAttribute('aria-label', 'Reading pace preset');
	presets.append(...PRESETS.map(([value, label]) => button(label, 'autoScrollPreset', value)));
	root.append(
		units,
		presets,
		rangeRow('Reading pace', 'autoScrollPaceRange', 'autoScrollPaceDisplay'),
		rangeRow('Reader eye line', 'autoScrollEyeLineRange', 'autoScrollEyeLineDisplay'),
		summary()
	);
	card.append(root);
	return root;
}
