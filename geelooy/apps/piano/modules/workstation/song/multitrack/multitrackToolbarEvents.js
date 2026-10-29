//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarEvents
 * The Awtsmoos lets the touch return sound to the second it truly chose;
 * Awtsmoos.com leaves the waveform still while its playhead flows.
 */
import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';
import { fitMultitrackSong } from './multitrackTimelineOperations.js';
import { toggleMultitrackPunchIn } from './multitrackPunchIn.js';
import { bindMultitrackScrubActions } from './multitrackScrubActions.js';

/** @param {Object} dom - Editor. @param {Object} state - Song state. @param {Object} context - Tools. */
export function bindMultitrackToolbarEvents(dom, state, context = {}) {
	dom.buttons.forEach((button, action) => {
		button.addEventListener('click', async () => {
			if (action === 'import') {
				dom.fileInput.value = '';
				dom.fileInput.click();
				return;
			}
			await safelyRun(async () => {
				if (action === 'fit') fitMultitrackSong(dom, state);
				else if (action === 'punch') await toggleMultitrackPunchIn(state, button);
				else await runMultitrackToolbarAction(action, state, context);
			}, state);
		});
	});
	dom.fileInput.addEventListener('change', async () => {
		await safelyRun(() => importMultitrackFiles(dom.fileInput.files, state), state);
	});
	dom.snapSelect.addEventListener('change', () => {
		state.setGridBeats(Number(dom.snapSelect.value));
		state.setStatus(state.selection.gridBeats > 0
			? `Snap grid · ${state.selection.gridBeats} beat` : 'Snap disabled · free timing');
	});
	bindMultitrackScrubActions(dom, state, (error) => {
		state.setStatus(`Multitrack: ${error?.message || 'Could not seek audio'}`);
	});
}

/** @param {Function} action - Audio operation. @param {Object} state - Errors. */
async function safelyRun(action, state) {
	try {
		await action();
	} catch (error) {
		console.error('Multitrack audio action failed', error);
		state.setStatus(`Multitrack: ${error?.message || 'Unknown editor error'}`);
	}
}
