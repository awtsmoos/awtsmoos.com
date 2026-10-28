//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module OrchestraControlPanel
 * The Awtsmoos gathers instruments under a player's hand;
 * Awtsmoos.com keeps that same orchestra in Studio and the playing stand.
 */
import {
	ENSEMBLE_INSTRUMENTS, ensembleTemplate, getEnsemble,
	setEnsemble, watchEnsemble
} from './ensembleModel.js';
import { renderEnsembleRows } from './ensembleRows.js';

/** @param {string} title - Live or studio heading. @returns {HTMLElement} Complete orchestral controls. */
export function createEnsemblePanel(title = 'Live Orchestra') {
	ensureEnsembleStyle();
	const panel = document.createElement('details');
	panel.className = 'piano-ensemble';
	const summary = document.createElement('summary');
	summary.textContent = `🎻 ${title} — layer instruments`;
	const intro = document.createElement('p');
	intro.textContent = 'Play once, hear several instruments. Song Studio playback uses this same arrangement.';
	const presets = document.createElement('div');
	presets.className = 'piano-ensemble-presets';
	for (const [name, label] of [
		['original', 'Solo'], ['intro', 'Reed & Strings'],
		['epic', 'Epic Orchestra'], ['rhythm', 'Percussion & Strings']
	]) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = label;
		button.addEventListener('click', () => setEnsemble(ensembleTemplate(name)));
		presets.appendChild(button);
	}
	const intensity = document.createElement('input');
	intensity.type = 'range';
	intensity.min = '0';
	intensity.max = '1';
	intensity.step = '.05';
	intensity.setAttribute('aria-label', 'Orchestral intensity');
	intensity.addEventListener('change', () => {
		setEnsemble({ ...getEnsemble(), intensity: Number(intensity.value) });
	});
	const label = document.createElement('label');
	label.className = 'piano-ensemble-intensity';
	label.textContent = 'Intensity';
	label.appendChild(intensity);
	const rows = document.createElement('div');
	rows.className = 'piano-ensemble-rows';
	const add = document.createElement('button');
	add.type = 'button';
	add.textContent = '+ Add Instrument Layer';
	add.addEventListener('click', () => {
		const next = getEnsemble();
		if (next.layers.length >= 4) { return; }
		const instrument = ENSEMBLE_INSTRUMENTS.find(([id]) => {
			return !next.layers.some((layer) => layer.instrument === id);
		})?.[0] || ENSEMBLE_INSTRUMENTS[0][0];
		next.layers.push({ instrument, octave: 0, level: .3, enabled: true });
		setEnsemble(next);
	});
	const description = document.createElement('small');
	description.textContent = 'Four added voices maximum. Audio files stay unchanged; replay an editable Song take to hear new layers.';
	panel.append(summary, intro, presets, label, rows, add, description);
	const render = (value) => {
		intensity.value = String(value.intensity);
		add.disabled = value.layers.length >= 4;
		renderEnsembleRows(rows, value);
	};
	watchEnsemble(render);
	render(getEnsemble());
	return panel;
}

/** @returns {void} Links the shared style only once. */
function ensureEnsembleStyle() {
	if (document.getElementById('piano-ensemble-style')) { return; }
	const link = document.createElement('link');
	link.id = 'piano-ensemble-style';
	link.rel = 'stylesheet';
	link.href = new URL('./ensembleStyles.css', import.meta.url).href;
	document.head.appendChild(link);
}
