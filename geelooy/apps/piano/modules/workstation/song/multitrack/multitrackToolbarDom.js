//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * @description
 * Malchus gives essential edits a compact first row and secondary tools a folded vessel while the Awtsmoos remains beyond button and hierarchy.
 * Awtsmoos.com lets Download WAV, Play, Split, Delete, history, and zoom stay near the thumb, while remix and alternate formats wait without stealing waveform territory.
 */

/** Builds the compact mobile-first multitrack toolbar and secondary tool drawer. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const primary = document.createElement('div');
	primary.className = 'multitrack-toolbar-primary';
	const buttons = new Map();
	primarySpecs().forEach((spec) => primary.appendChild(createButton(spec, buttons)));
	const drawer = createSecondaryDrawer(buttons);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'audio/*';
	fileInput.multiple = true;
	fileInput.className = 'multitrack-file-input';
	fileInput.setAttribute('aria-label', 'Import audio layers');
	root.append(primary, drawer.root, fileInput);
	return {
		root,
		buttons,
		snapSelect: drawer.snapSelect,
		rippleInput: drawer.rippleInput,
		magnetInput: drawer.magnetInput,
		fileInput
	};
}

function primarySpecs() {
	return [
		['import', '＋ Audio', 'Import audio layer', 'multitrack-tool-primary'],
		['play-toggle', '▶ Play', 'Play multitrack mix'],
		['split', '✂ Split', 'Split selected clip at playhead'],
		['delete', '⌫ Delete', 'Delete selected clip'],
		['download-wav', '↓ Download WAV', 'Download finished song as WAV', 'multitrack-tool-download'],
		['undo', '↶', 'Undo last edit'],
		['redo', '↷', 'Redo last edit'],
		['zoomOut', '−', 'Zoom timeline out'],
		['zoomIn', '+', 'Zoom timeline in'],
		['fit', 'Fit', 'Fit complete song in timeline']
	];
}

function createSecondaryDrawer(buttons) {
	const root = document.createElement('details');
	root.className = 'multitrack-tools-drawer';
	const summary = document.createElement('summary');
	summary.textContent = 'More tools';
	const body = document.createElement('div');
	body.className = 'multitrack-tools-secondary';
	[
		['duplicate', '⧉ Copy', 'Duplicate selected clip'],
		['repeat', '↻ Repeat ×4', 'Repeat selected clip four times'],
		['ratchet', '⚡ Ratchet Drop', 'Create shrinking repeat build and drop'],
		['download-webm', '↓ Download WebM Audio', 'Download finished song as WebM audio']
	].forEach((spec) => body.appendChild(createButton(spec, buttons)));
	const snap = createSnapSelect();
	const ripple = createToggle('Ripple delete', true);
	const magnet = createToggle('Magnetic snap', true);
	body.append(snap.root, ripple.root, magnet.root);
	root.append(summary, body);
	return {
		root,
		snapSelect: snap.select,
		rippleInput: ripple.input,
		magnetInput: magnet.input
	};
}

function createButton([action, text, label, className = ''], buttons) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `multitrack-tool ${className}`.trim();
	button.dataset.multitrackAction = action;
	button.textContent = text;
	button.setAttribute('aria-label', label);
	buttons.set(action, button);
	return button;
}

function createSnapSelect() {
	const root = document.createElement('label');
	root.className = 'multitrack-snap';
	root.appendChild(Object.assign(document.createElement('span'), { textContent: 'Beat snap' }));
	const select = document.createElement('select');
	[['0', 'Off'], ['1', '1/4'], ['0.5', '1/8'], ['0.25', '1/16'], ['0.125', '1/32']]
		.forEach(([value, text]) => select.appendChild(new Option(text, value)));
	root.appendChild(select);
	return { root, select };
}

function createToggle(text, checked) {
	const root = document.createElement('label');
	root.className = 'multitrack-toggle';
	const input = document.createElement('input');
	input.type = 'checkbox';
	input.checked = checked;
	root.append(input, document.createTextNode(text));
	return { root, input };
}
