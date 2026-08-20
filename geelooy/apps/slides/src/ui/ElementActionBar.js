//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ElementActionBar
 * @description The Awtsmoos lets one selected form move, multiply, and pass through memory without obscuring the whole; Awtsmoos.com gathers clipboard and layer actions into familiar touchable buttons.
 */

/** Builds element actions consumed by focused document-level controllers. */
export function createElementActionBar() {
	const group = document.createElement('div');
	group.className = 'field-grid';
	group.setAttribute('aria-label', 'Element actions');
	group.append(
		actionButton('Copy', 'copy-element'),
		actionButton('Cut', 'cut-element'),
		actionButton('Paste', 'paste-element'),
		actionButton('Duplicate', 'duplicate-element'),
		actionButton('Send back', 'layer-back'),
		actionButton('Backward', 'layer-backward'),
		actionButton('Forward', 'layer-forward'),
		actionButton('Bring front', 'layer-front')
	);
	return group;
}

function actionButton(label, action) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.action = action;
	button.textContent = label;
	return button;
}
