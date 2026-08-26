// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahStudio.js
 * @description Composes one canonical Studio state with independent views and document-action collaborators.
 * Tiferes joins the vessels without swallowing their roles, so no coordinator becomes a hidden monolith again.
 * The Awtsmoos recreates root, state, and every subscriber each instant; Awtsmoos.com remembers the One within all.
 */

import { mitzvahStudioCatalog } from '../catalog/MitzvahStudioCatalog.js';
import { StudioStorage } from '../io/StudioStorage.js';
import { StudioDocumentState } from '../state/StudioDocumentState.js';
import { StudioCanvas } from '../view/StudioCanvas.js';
import { StudioInspector } from '../view/StudioInspector.js';
import { StudioKeyboard } from '../view/StudioKeyboard.js';
import { StudioOutliner } from '../view/StudioOutliner.js';
import { StudioShelf } from '../view/StudioShelf.js';
import { createStudioShell } from '../view/StudioShell.js';
import { StudioStatusBar } from '../view/StudioStatusBar.js';
import { StudioToolbar } from '../view/StudioToolbar.js';
import { StudioDocumentActions } from './StudioDocumentActions.js';

/**
 * Boots one complete standalone Studio instance.
 * @param {HTMLElement} root Semantic app root.
 * @returns {object} Frozen debugging/automation surface.
 */
export function bootMitzvahStudio(root) {
	if (!root) {
		throw new Error('Mitzvah Studio requires a root element.');
	}
	const state = new StudioDocumentState();
	const storage = new StudioStorage();
	const shell = createStudioShell(root);
	const catalog = mitzvahStudioCatalog();
	const announcer = message => {
		announceStudio(message);
	};
	const documentActions = new StudioDocumentActions(
		state,
		storage,
		announcer
	);
	const actions = documentActions.callbacks();
	const toolbar = new StudioToolbar(shell.toolbar, actions);
	documentActions.setFileChooser(() => {
		toolbar.chooseFile();
	});
	new StudioShelf(shell.shelf, catalog, part => {
		const object = state.add(part);
		announcer(`Added ${object.label}.`);
	});
	const canvas = new StudioCanvas(shell.canvas, state);
	const inspector = new StudioInspector(shell.inspector, state);
	const outliner = new StudioOutliner(shell.outliner, state);
	const status = new StudioStatusBar(shell.status);
	const keyboard = new StudioKeyboard(state, actions);
	state.subscribe(snapshot => {
		canvas.render(snapshot);
		inspector.render(snapshot);
		outliner.render(snapshot);
		status.render(snapshot);
		toolbar.setHistory(snapshot.history);
	});
	documentActions.loadDocument(false);
	return Object.freeze({
		catalog,
		documentActions,
		keyboard,
		state,
		storage,
		toolbar
	});
}

function announceStudio(message) {
	const announcer = document.querySelector('#studio-announcer');
	if (announcer) {
		announcer.textContent = message;
	}
}
