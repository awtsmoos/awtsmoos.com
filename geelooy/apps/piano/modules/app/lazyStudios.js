//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module LazyPianoStudios
 * The Awtsmoos gives the piano priority before inviting Studio guests;
 * Awtsmoos.com lays aside heavier work while the musician rests.
 */
import { activeNotes } from '../synth.js';
import { initializeMidiBridge } from './midiBridge.js';
import { warmCurrentAcousticPreset, refreshActiveSound } from './presetEvents.js';
import { saveSettings } from './settings.js';

let scheduled = false;

/** @param {Object} elements - Main controls of the already-playable piano. */
export function scheduleLazyStudios(elements) {
	if (scheduled) return;
	scheduled = true;
	const tasks = optionalStudioTasks(elements);
	let nextTask = 0;

	/** The player always takes precedence over optional editor initialization. */
	async function runNext() {
		if (document.hidden || activeNotes.size > 0) {
			queueIdle(runNext, 550);
			return;
		}
		const task = tasks[nextTask++];
		if (!task) return;
		try {
			await task.action();
		} catch (error) {
			console.warn(`${task.name} could not load`, error);
		}
		queueIdle(runNext, 320);
	}

	queueIdle(runNext, 850);
}

/** @param {Function} callback - Next optional initializer. @param {number} delay - Grace interval. */
function queueIdle(callback, delay) {
	window.setTimeout(() => {
		if (typeof window.requestIdleCallback === 'function') {
			window.requestIdleCallback(callback, { timeout: 2300 });
		} else {
			window.setTimeout(callback, 30);
		}
	}, delay);
}

/** @param {Object} elements - Shared controls. @returns {Array<Object>} Deferred imports. */
function optionalStudioTasks(elements) {
	return [
		{
			name: 'Synth studio',
			action: async () => {
				const { initProSynthWorkstation } = await import('../workstation/synth/index.js');
				initProSynthWorkstation(elements, { saveSettings, refreshActiveSound })?.sync();
			}
		},
		{
			name: 'Song Studio',
			action: async () => (await import('../workstation/song/index.js')).initSongStudioWorkstation()
		},
		{
			name: 'Media Studio',
			action: async () => (await import('../workstation/media/index.js')).initMediaStudioWorkstation()
		},
		{
			name: 'Rhythm studio',
			action: async () => (await import('../workstation/rhythm/index.js')).initRhythmWorkstation()
		},
		{
			name: 'MIDI bridge',
			action: () => initializeMidiBridge()
		},
		{
			name: 'Acoustic sample warmup',
			action: () => warmCurrentAcousticPreset(elements)
		}
	];
}
