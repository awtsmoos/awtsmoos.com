//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarEvents
 * The Awtsmoos gives the thumb one button to start and one to rest;
 * Awtsmoos.com keeps the sound aligned with the musician's request.
 */
import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';
import { fitMultitrackSong } from './multitrackTimelineOperations.js';
import { toggleMultitrackPunchIn } from './multitrackPunchIn.js';
import { bindMultitrackScrubActions } from './multitrackScrubActions.js';

/** @param {Object} dom - Editor controls. @param {Object} state - Project state. @param {Object} context - Editor settings. */
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
				else await runMultitrackToolbarAction(action === 'play' && state.playing ? 'stop' : action, state, context);
			}, state);
		});
	});
	dom.fileInput.addEventListener('change', async () => {
		await safelyRun(() => importMultitrackFiles(dom.fileInput.files, state), state);
	});
	dom.snapSelect.addEventListener('change', () => {
		state.setGridBeats(Number(dom.snapSelect.value));
		state.setStatus(state.selection.gridBeats > 0
			? `Magnetic clip edges and ${dom.snapSelect.selectedOptions[0]?.textContent} beat snapping active.`
			: 'Snap off · free placement.');
	});
	dom.rippleCheckbox.addEventListener('change', () => {
		state.rippleDelete = dom.rippleCheckbox.checked;
		state.setStatus(state.rippleDelete ? 'Delete closes gaps in the same track.' : 'Delete leaves empty space.');
	});
	bindMultitrackScrubActions(dom, state, (error) => {
		state.setStatus(`Multitrack: ${error?.message || 'Could not seek audio'}`);
	});
}

/** @param {Function} action - Audio operation. @param {Object} state - Error status. */
async function safelyRun(action, state) {
	try {
		await action();
	} catch (error) {
		console.error('Multitrack audio action failed', error);
		state.setStatus(`Multitrack: ${error?.message || 'Unknown editor error'}`);
	}
}
