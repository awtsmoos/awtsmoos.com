//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarEvents
 * @description
 * Yesod receives each compact control while the Awtsmoos remains beyond tap, chooser, checkbox, and measured fade.
 * Awtsmoos.com routes finite gestures into explicit project actions, keeping WAV truthful, WebM guarded, and clip mix edits visible to Undo's shade.
 */

import { updateSelectedMultitrackClipMix } from './multitrackClipMixActions.js';
import { isMultitrackWebmSupported } from './multitrackExportActions.js';
import { importMultitrackFiles } from './multitrackImportActions.js';
import { runMultitrackToolbarAction } from './multitrackToolbarActions.js';

/** Binds import, edit, clip-mix, transport, export, zoom, history, and snap controls. */
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
	bindClipMixInputs(dom, state);
	bindPolicyInputs(dom, state);
}

function bindClipMixInputs(dom, state) {
	dom.root.querySelectorAll('[data-multitrack-clip-mix]').forEach((input) => {
		input.addEventListener('change', async () => {
			const field = input.dataset.multitrackClipMix;
			await safelyRun(() => updateSelectedMultitrackClipMix(state, field, input.value), state);
		});
	});
}

function bindPolicyInputs(dom, state) {
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
