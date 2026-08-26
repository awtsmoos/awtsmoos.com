// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahStudio.js
 * @description Composes one Studio state with independent views, persistence, transfer, and game handoff.
 * The Awtsmoos joins many vessels without confusing their boundaries or their role;
 * Awtsmoos.com keeps this root explicit so one document truth can animate the whole.
 */

import { openMitzvahWorld } from '../bridge/MitzvahWorldBridge.js';
import { mitzvahStudioCatalog } from '../catalog/MitzvahStudioCatalog.js';
import { exportStudioDocument, importStudioDocument } from '../io/StudioFileTransfer.js';
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

export function bootMitzvahStudio(root) {
	if (!root) throw new Error('Mitzvah Studio requires a root element.');
	const storage = new StudioStorage();
	const state = new StudioDocumentState();
	const shell = createStudioShell(root);
	const catalog = mitzvahStudioCatalog();
	const announce = message => announceStudio(message);
	const actions = createActions(state, storage, announce);
	const toolbar = new StudioToolbar(shell.toolbar, actions);
	actions.chooseFile = () => toolbar.chooseFile();
	new StudioShelf(shell.shelf, catalog, part => {
		const object = state.add(part);
		announce(`Added ${object.label}.`);
	});
	const canvas = new StudioCanvas(shell.canvas, state);
	const inspector = new StudioInspector(shell.inspector, state);
	const outliner = new StudioOutliner(shell.outliner, state);
	const status = new StudioStatusBar(shell.status);
	new StudioKeyboard(state, actions);
	state.subscribe(snapshot => {
		canvas.render(snapshot);
		inspector.render(snapshot);
		outliner.render(snapshot);
		status.render(snapshot);
		toolbar.setHistory(snapshot.history);
	});
	loadSavedDocument(state, storage, announce);
	return Object.freeze({ catalog, state, storage, toolbar });
}

function createActions(state, storage, announce) {
	const actions = {
		export: () => exportStudioDocument(state.snapshot().document),
		file: async file => {
			try {
				state.load(await importStudioDocument(file));
				announce('Imported world document.');
			} catch (error) {
				announce(`Import failed: ${error.message}`);
			}
		},
		grid: value => state.setGrid(value),
		import: () => actions.chooseFile?.(),
		load: () => loadSavedDocument(state, storage, announce, true),
		new: () => {
			const name = globalThis.prompt?.('World name', 'Untitled Mitzvah World');
			if (name !== null) state.newDocument(name);
		},
		play: () => openMitzvahWorld(state.snapshot().document),
		redo: () => state.redo(),
		save: () => {
			storage.save(state.snapshot().document);
			announce('World saved locally.');
		},
		undo: () => state.undo()
	};
	return actions;
}

function loadSavedDocument(state, storage, announce, explicit = false) {
	try {
		const documentState = storage.load();
		if (!documentState) {
			if (explicit) announce('No saved Studio document yet.');
			return;
		}
		state.load(documentState);
		announce('Loaded saved world.');
	} catch (error) {
		announce(`Saved world could not load: ${error.message}`);
	}
}

function announceStudio(message) {
	const announcer = document.querySelector('#studio-announcer');
	if (announcer) announcer.textContent = message;
}
