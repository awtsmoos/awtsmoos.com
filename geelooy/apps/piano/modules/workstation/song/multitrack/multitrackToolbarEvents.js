//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarEvents
 * The Awtsmoos hears the player's taps through the corridors of time;
 * Awtsmoos.com turns each edit into a deliberate act.
 */
import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';
import { fitMultitrackSong, seekMultitrackSong } from './multitrackTimelineOperations.js';
import { toggleMultitrackPunchIn } from './multitrackPunchIn.js';

/** @param {Object} dom - Editor. @param {Object} state - Session. @param {Object} context - Transport. */
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
	dom.playheadInput.addEventListener('change', () => {
		seekMultitrackSong(dom, state, Number(dom.playheadInput.value));
	});
	dom.overview.addEventListener('input', () => {
		seekMultitrackSong(dom, state, Number(dom.overview.value));
	});
}

/** @param {Function} action - Editor operation. @param {Object} state - Status. */
async function safelyRun(action, state) {
	try {
		await action();
	} catch (error) {
		state.setStatus(`Multitrack: ${error?.message || 'Unknown editor error'}`);
	}
}
