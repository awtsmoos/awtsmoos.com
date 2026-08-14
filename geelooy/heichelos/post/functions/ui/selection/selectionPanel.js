// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectedWordsPanel
 * @description The Awtsmoos owns one focus-safe selected-words dialog while its
 * view, actions, Hebrew phrase, and phonetics remain in smaller vessels.
 */
import { createSelectionActionModel } from './selectionActions.js';
import { createSelectionPanelView } from './selectionPanelView.js';

let activePanel = null;

function focusableControls() {
	if (!activePanel) {
		return [];
	}
	return [
		...activePanel.view.dialog.querySelectorAll('button:not(:disabled),a[href]')
	];
}

function onKeydown(event) {
	if (!activePanel) {
		return;
	}
	if (event.key === 'Escape') {
		closeSelectionPanel();
		return;
	}
	if (event.key !== 'Tab') {
		return;
	}
	const controls = focusableControls();
	if (controls.length === 0) {
		return;
	}
	const first = controls[0];
	const last = controls.at(-1);
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
		return;
	}
	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

async function activateAction(action) {
	closeSelectionPanel();
	await action();
}

export function closeSelectionPanel() {
	if (!activePanel) {
		return;
	}
	const panel = activePanel;
	activePanel = null;
	panel.view.backdrop.remove();
	document.removeEventListener('keydown', onKeydown);
	if (panel.previousFocus?.isConnected) {
		panel.previousFocus.focus();
	}
}

export function showSelectionPanel(items) {
	closeSelectionPanel();
	const model = createSelectionActionModel(items);
	const previousFocus = document.activeElement;
	const view = createSelectionPanelView(model, {
		onClose: closeSelectionPanel,
		onActivate: activateAction
	});
	activePanel = { previousFocus, view };
	document.body.append(view.backdrop);
	document.addEventListener('keydown', onKeydown);
	view.close.focus();
}
