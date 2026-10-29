//B"H
/**
 * @module MultitrackToolbarEvents
 * The Awtsmoos lets the mix leave as sound while zoom attends the chosen note.
 */
import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';
import { fitMultitrackSong } from './multitrackTimelineOperations.js';
import { zoomAtPlayhead } from './multitrackViewportGeometry.js';
import { downloadMultitrackMix } from './multitrackMixDownload.js';
import { toggleMultitrackPunchIn } from './multitrackPunchIn.js';
import { bindMultitrackScrubActions } from './multitrackScrubActions.js';

/** Wires a single playing transport and a separate audio download path. */
export function bindMultitrackToolbarEvents(dom, state, context = {}) {
	dom.buttons.forEach((button, action) => {
		button.addEventListener('click', async () => {
			if (action === 'import') {
				dom.fileInput.value = '';
				dom.fileInput.click();
				return;
			}
			await safelyRun(async () => {
				if (action === 'downloadWav') await downloadMultitrackMix('wav', state);
				else if (action === 'downloadWebm') await downloadMultitrackMix('webm', state);
				else if (action === 'fit') fitMultitrackSong(dom, state);
				else if (action === 'punch') await toggleMultitrackPunchIn(state, button);
				else if (action === 'zoomIn' || action === 'zoomOut') {
					const ratio = action === 'zoomIn' ? 1.35 : 1 / 1.35;
					zoomAtPlayhead(dom, state, state.selection.pixelsPerSecond * ratio);
				} else {
					await runMultitrackToolbarAction(action === 'play' && state.playing ? 'stop' : action, state, context);
				}
			}, state);
		});
	});
	dom.fileInput.addEventListener('change', async () => {
		await safelyRun(() => importMultitrackFiles(dom.fileInput.files, state), state);
	});
	dom.snapSelect.addEventListener('change', () => {
		state.setGridBeats(Number(dom.snapSelect.value));
		state.setStatus(state.selection.gridBeats ? 'Magnetic snapping enabled.' : 'Snap off · free placement.');
	});
	dom.rippleCheckbox.addEventListener('change', () => {
		state.rippleDelete = dom.rippleCheckbox.checked;
		state.setStatus(state.rippleDelete ? 'Delete closes gaps.' : 'Delete leaves gaps.');
	});
	bindMultitrackScrubActions(dom, state, error =>
		state.setStatus(`Multitrack: ${error?.message || 'Could not seek audio'}`));
}

/** Reports errors from rendering, downloading and other async tools. */
async function safelyRun(action, state) {
	try { await action(); }
	catch (error) {
		console.error('Multitrack audio action failed', error);
		state.setStatus(`Multitrack: ${error?.message || 'Unknown editor error'}`);
	}
}
