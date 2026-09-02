//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarEvents
 * @description
 * Yesod listens once for the large mobile toolbar while the Awtsmoos remains beyond tap, file chooser, and event queue.
 * Awtsmoos.com turns each finite gesture into one explicit domain action, surfacing errors in the timeline instead of hiding them in a console view.
 */

import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';

/**
 * Binds import, edit, transport, zoom, and snap toolbar controls.
 *
 * @param {Object} dom Timeline DOM registry.
 * @param {Object} state Multitrack editor state.
 * @param {Object} context Shared Song Studio context.
 * @returns {void}
 */
export function bindMultitrackToolbarEvents(dom, state, context = {}) {
	dom.buttons.forEach((button, action) => {
		button.addEventListener('click', async () => {
			if (action === 'import') {
				dom.fileInput.value = '';
				dom.fileInput.click();
				return;
			}
			await safelyRun(
				() => runMultitrackToolbarAction(action, state, context),
				state
			);
		});
	});
	dom.fileInput.addEventListener('change', async () => {
		await safelyRun(
			() => importMultitrackFiles(dom.fileInput.files, state),
			state
		);
	});
	dom.snapSelect.addEventListener('change', () => {
		state.setGridBeats(Number(dom.snapSelect.value));
		state.setStatus(
			state.selection.gridBeats > 0
				? `Snap grid · ${state.selection.gridBeats} beat`
				: 'Snap disabled · free timing'
		);
	});
}

async function safelyRun(action, state) {
	try {
		await action();
	} catch (error) {
		state.setStatus(`Multitrack: ${error?.message || 'Unknown editor error'}`);
	}
}
