//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module LazyPianoStudios
 * The Awtsmoos gives the first note precedence over every grand machine;
 * Awtsmoos.com unfolds its studios only after the keys are seen.
 */
import { initializeMidiBridge } from './midiBridge.js';
import { warmCurrentAcousticPreset, refreshActiveSound } from './presetEvents.js';
import { saveSettings } from './settings.js';

let scheduled = false;

/** @param {Object} elements - Essential piano settings. @returns {void} Non-blocking optional initialization. */
export function scheduleLazyStudios(elements) {
	if (scheduled) {
		return;
	}
	scheduled = true;
	const run = () => {
		void initializeOptionalStudios(elements);
	};
	if (typeof window.requestIdleCallback === 'function') {
		window.requestIdleCallback(run, { timeout: 900 });
	} else {
		window.setTimeout(run, 100);
	}
}

/** @param {Object} elements - UI controls. @returns {Promise<void>} Optional features. */
async function initializeOptionalStudios(elements) {
	const tasks = [
		['Synth studio', () => import('../workstation/synth/index.js').then(({ initProSynthWorkstation }) => {
			initProSynthWorkstation(elements, { saveSettings, refreshActiveSound })?.sync();
		})],
		['Song Studio', () => import('../workstation/song/index.js').then(({ initSongStudioWorkstation }) => initSongStudioWorkstation())],
		['Media studio', () => import('../workstation/media/index.js').then(({ initMediaStudioWorkstation }) => initMediaStudioWorkstation())],
		['Rhythm studio', () => import('../workstation/rhythm/index.js').then(({ initRhythmWorkstation }) => initRhythmWorkstation())]
	];
	for (const [name, action] of tasks) {
		try {
			await action();
		} catch (error) {
			console.warn(`${name} could not load`, error);
		}
		await new Promise((resolve) => window.setTimeout(resolve, 0));
	}
	try { initializeMidiBridge(); } catch (error) { console.warn('MIDI unavailable', error); }
	void warmCurrentAcousticPreset(elements);
}
