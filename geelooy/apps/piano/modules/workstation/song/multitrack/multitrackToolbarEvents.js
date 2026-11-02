//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarEvents
 * @description
 * Yesod listens once for compact editor controls while the Awtsmoos remains beyond tap, chooser, checkbox, and event queue.
 * Awtsmoos.com turns each finite gesture into one explicit action and surfaces browser limitations in the timeline instead of hiding failure from view.
 */

import { isMultitrackWebmSupported } from './multitrackExportActions.js';
import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';

/** Binds import, edit, transport, export, zoom, history, and snap controls. */
export function bindMultitrackToolbarEvents(dom, state, context = {}) {
	configureWebmButton(dom);
	dom.buttons.forEach((button, action) => {
		button.addEventListener('click', async () => {
			if (action === 'import') {
				dom.fileInput.value = '';
				dom.fileInput.click();
				return;
			}
			await safelyRun(() => runMultitrackToolbarAction(action, state, context), state);
		});
	});
	dom.fileInput.addEventListener('change', async () => {
		await safelyRun(() => importMultitrackFiles(dom.fileInput.files, state), state);
	});
	dom.snapSelect.addEventListener('change', () => {
		state.setGridBeats(Number(dom.snapSelect.value));
		state.setStatus(state.selection.gridBeats > 0
			? `Beat snap · ${state.selection.gridBeats} beat`
			: 'Beat snap off · magnetic snap remains independent.');
	});
	dom.rippleInput.addEventListener('change', () => {
		state.setRippleDelete(dom.rippleInput.checked);
		state.setStatus(dom.rippleInput.checked
			? 'Ripple delete on · deleted clip gaps close.'
			: 'Preserve gaps on · deleted clip space remains.');
	});
	dom.magnetInput.addEventListener('change', () => {
		state.setMagneticSnap(dom.magnetInput.checked);
		state.setStatus(dom.magnetInput.checked ? 'Magnetic clip snapping on.' : 'Magnetic clip snapping off.');
	});
}

function configureWebmButton(dom) {
	const button = dom.buttons.get('download-webm');
	if (!button || isMultitrackWebmSupported()) {
		return;
	}
	button.disabled = true;
	button.title = 'This browser does not support WebM audio recording. Download WAV is available.';
}

async function safelyRun(action, state) {
	try {
		await action();
	} catch (error) {
		state.setStatus(`Multitrack: ${error?.message || 'Unknown editor error'}`);
	}
}
