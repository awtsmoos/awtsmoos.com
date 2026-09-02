//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * @description
 * Malchus gives the timeline large touchable doors for import, transport, split, duplicate, repeat, ratchet, delete, zoom, and snap.
 * The Awtsmoos is beyond every button; Awtsmoos.com lets each action remain explicit and kind, so a thumb can edit quickly without destructive gestures hidden behind.
 */

/** Builds the mobile-first multitrack toolbar. @returns {Object} Toolbar registry. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const buttons = new Map();
	buttonSpecs().forEach((spec) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = `multitrack-tool ${spec.className || ''}`.trim();
		button.dataset.multitrackAction = spec.action;
		button.textContent = spec.text;
		button.setAttribute('aria-label', spec.label);
		buttons.set(spec.action, button);
		root.appendChild(button);
	});
	const snap = createSnapSelect();
	root.appendChild(snap.root);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'audio/*';
	fileInput.multiple = true;
	fileInput.className = 'multitrack-file-input';
	fileInput.setAttribute('aria-label', 'Import audio layers');
	root.appendChild(fileInput);
	return {
		root,
		buttons,
		snapSelect: snap.select,
		fileInput
	};
}

function buttonSpecs() {
	return [
		{ action: 'import', text: '＋ Audio', label: 'Import audio layer', className: 'multitrack-tool-primary' },
		{ action: 'play', text: '▶ Play', label: 'Play multitrack mix' },
		{ action: 'stop', text: '■ Stop', label: 'Stop multitrack mix' },
		{ action: 'split', text: '✂ Split', label: 'Split selected clip at playhead' },
		{ action: 'duplicate', text: '⧉ Copy', label: 'Duplicate selected clip' },
		{ action: 'repeat', text: '↻ Repeat ×4', label: 'Repeat selected clip four times' },
		{ action: 'ratchet', text: '⚡ Ratchet Drop', label: 'Create shrinking repeat build and drop', className: 'multitrack-tool-remix' },
		{ action: 'delete', text: '⌫ Delete', label: 'Delete selected clip' },
		{ action: 'zoomOut', text: '−', label: 'Zoom timeline out' },
		{ action: 'zoomIn', text: '+', label: 'Zoom timeline in' }
	];
}

function createSnapSelect() {
	const root = document.createElement('label');
	root.className = 'multitrack-snap';
	const label = document.createElement('span');
	label.textContent = 'Snap';
	const select = document.createElement('select');
	[
		['0', 'Off'],
		['1', '1/4'],
		['0.5', '1/8'],
		['0.25', '1/16'],
		['0.125', '1/32']
	].forEach(([value, text]) => {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = text;
		select.appendChild(option);
	});
	select.value = '0.25';
	root.append(label, select);
	return { root, select };
}
