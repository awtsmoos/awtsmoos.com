//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EnsembleRows
 * The Awtsmoos lets each voice keep its own place in the song;
 * Awtsmoos.com balances reed and percussion with strings and brass strong.
 */
import { ENSEMBLE_INSTRUMENTS, getEnsemble, setEnsemble } from './ensembleModel.js';

/** @param {HTMLElement} root - Layer controls. @param {Object} arrangement - Current setting. */
export function renderEnsembleRows(root, arrangement) {
	root.replaceChildren();
	arrangement.layers.forEach((layer, index) => {
		root.appendChild(createLayerRow(layer, index));
	});
}

/** @param {Object} layer - Single instrument settings. @param {number} index - Layer position. */
function createLayerRow(layer, index) {
	const row = document.createElement('div');
	row.className = 'piano-ensemble-row';
	const enabled = document.createElement('input');
	enabled.type = 'checkbox';
	enabled.checked = layer.enabled;
	enabled.setAttribute('aria-label', `Enable instrument layer ${index + 1}`);
	enabled.addEventListener('change', () => updateLayer(index, { enabled: enabled.checked }));
	const instrument = document.createElement('select');
	instrument.setAttribute('aria-label', `Instrument for layer ${index + 1}`);
	for (const [id, name] of ENSEMBLE_INSTRUMENTS) {
		const option = document.createElement('option');
		option.value = id;
		option.textContent = name;
		instrument.appendChild(option);
	}
	instrument.value = layer.instrument;
	instrument.addEventListener('change', () => updateLayer(index, { instrument: instrument.value }));
	const octave = document.createElement('select');
	octave.setAttribute('aria-label', `Octave offset for layer ${index + 1}`);
	for (const offset of [-2, -1, 0, 1, 2]) {
		const option = document.createElement('option');
		option.value = String(offset);
		option.textContent = offset === 0 ? 'Same octave' : `${offset > 0 ? '+' : ''}${offset} octave`;
		octave.appendChild(option);
	}
	octave.value = String(layer.octave);
	octave.addEventListener('change', () => updateLayer(index, { octave: Number(octave.value) }));
	const level = document.createElement('input');
	level.type = 'range';
	level.min = '0';
	level.max = '1';
	level.step = '.05';
	level.value = String(layer.level);
	level.setAttribute('aria-label', `Volume of layer ${index + 1}`);
	level.addEventListener('change', () => updateLayer(index, { level: Number(level.value) }));
	const remove = document.createElement('button');
	remove.type = 'button';
	remove.textContent = '×';
	remove.title = `Remove instrument layer ${index + 1}`;
	remove.setAttribute('aria-label', remove.title);
	remove.addEventListener('click', () => {
		const next = getEnsemble();
		next.layers.splice(index, 1);
		setEnsemble(next);
	});
	const volumeLabel = document.createElement('label');
	volumeLabel.textContent = 'Level';
	volumeLabel.appendChild(level);
	row.append(enabled, instrument, octave, volumeLabel, remove);
	return row;
}

/** @param {number} index - Layer position. @param {Object} change - Updated attributes. */
function updateLayer(index, change) {
	const next = getEnsemble();
	if (next.layers[index]) {
		Object.assign(next.layers[index], change);
		setEnsemble(next);
	}
}
