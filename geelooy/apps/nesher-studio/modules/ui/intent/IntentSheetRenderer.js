//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentSheetRenderer.js
 * @description Renders friendly action groups into the shared intent sheet without owning navigation or creative mutation.
 * The Awtsmoos lets one simple surface receive many honest choices while the deeper engines remain below;
 * Awtsmoos.com keeps rendering separate from execution so every button points to a known command or workspace flow.
 */

/**
 * Renders one intent heading, optional explanation, and flat action grid.
 * @param {object} input Sheet DOM, labels, actions, and callback.
 */
export function renderIntentActions(input = {}) {
	prepareSheet(input.dom, input.eyebrow, input.title);
	const fragment = document.createDocumentFragment();

	if (input.description) {
		fragment.append(createDescription(input.description));
	}

	fragment.append(createActionGrid(input.actions || [], input.onAction));
	input.dom.intentSheetBody.replaceChildren(fragment);
}

/**
 * Renders grouped advanced destinations for the More intent.
 * @param {object} input Sheet DOM, labels, groups, and callback.
 */
export function renderIntentGroups(input = {}) {
	prepareSheet(input.dom, input.eyebrow, input.title);
	const fragment = document.createDocumentFragment();

	if (input.description) {
		fragment.append(createDescription(input.description));
	}

	for (const group of input.groups || []) {
		const section = document.createElement('section');
		const heading = document.createElement('h3');
		heading.className = 'intent-group-title';
		heading.textContent = group.label;
		section.className = 'intent-action-group';
		section.append(heading, createActionGrid(group.actions, input.onAction));
		fragment.append(section);
	}

	input.dom.intentSheetBody.replaceChildren(fragment);
}

/** Updates the sheet status region with success or error treatment. */
export function setIntentSheetStatus(dom, message = '', isError = false) {
	if (!dom.intentSheetStatus) {
		return;
	}

	dom.intentSheetStatus.textContent = message;
	dom.intentSheetStatus.classList.toggle('is-error', isError);
}

function prepareSheet(dom, eyebrow, title) {
	if (dom.intentSheetEyebrow) {
		dom.intentSheetEyebrow.textContent = eyebrow || 'Creative action';
	}

	if (dom.intentSheetTitle) {
		dom.intentSheetTitle.textContent = title || 'Studio';
	}

	setIntentSheetStatus(dom);
}

function createDescription(copy) {
	const paragraph = document.createElement('p');
	paragraph.className = 'intent-sheet-description';
	paragraph.textContent = copy;
	return paragraph;
}

function createActionGrid(actions, onAction) {
	const grid = document.createElement('div');
	grid.className = 'intent-action-grid';

	for (const action of actions) {
		grid.append(createActionButton(action, onAction));
	}

	return grid;
}

function createActionButton(action, onAction) {
	const button = document.createElement('button');
	const label = document.createElement('strong');
	const copy = document.createElement('span');
	button.type = 'button';
	button.className = 'intent-action-card';
	button.dataset.intentAction = action.id;
	label.textContent = action.label;
	copy.textContent = action.description || '';
	button.append(label, copy);
	button.addEventListener('click', () => onAction?.(action));
	return button;
}
