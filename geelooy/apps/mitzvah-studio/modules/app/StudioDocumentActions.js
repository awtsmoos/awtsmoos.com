// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentActions.js
 * @description Coordinates document-level commands while view composition remains pure and state stays canonical.
 * Chesed offers creation and export; Gevurah guards import and persistence; Tiferes joins them as one explicit command vessel.
 * The Awtsmoos recreates command, document, and destination each instant; Awtsmoos.com remembers the One within action.
 */

import {
	openMitzvahWorld
} from '../bridge/MitzvahWorldBridge.js';
import {
	exportStudioDocument,
	importStudioDocument
} from '../io/StudioFileTransfer.js';

export class StudioDocumentActions {
	/**
	 * @param {StudioDocumentState} state Shared authoring state.
	 * @param {StudioStorage} storage Portable document storage.
	 * @param {(message:string)=>void} announce Accessible status announcer.
	 */
	constructor(state, storage, announce) {
		this.state = state;
		this.storage = storage;
		this.announce = announce;
		this.chooseFile = null;
	}

	/** @returns {object} Callback surface consumed by Toolbar and Keyboard. */
	callbacks() {
		return {
			export: () => this.exportDocument(),
			file: file => this.importFile(file),
			grid: value => this.state.setGrid(value),
			import: () => this.chooseFile?.(),
			load: () => this.loadDocument(true),
			new: () => this.newDocument(),
			play: () => this.openGame(),
			redo: () => this.state.redo(),
			save: () => this.saveDocument(),
			undo: () => this.state.undo()
		};
	}

	/** @param {Function} chooser Toolbar-owned file chooser callback. */
	setFileChooser(chooser) {
		this.chooseFile = chooser;
	}

	newDocument() {
		const name = globalThis.prompt?.(
			'World name',
			'Untitled Mitzvah World'
		);
		if (name !== null) {
			this.state.newDocument(name);
			this.announce('Created a new world.');
		}
	}

	saveDocument() {
		this.storage.save(this.state.snapshot().document);
		this.announce('World saved locally.');
	}

	loadDocument(explicit = false) {
		try {
			const documentState = this.storage.load();
			if (!documentState) {
				if (explicit) {
					this.announce('No saved Studio document yet.');
				}
				return false;
			}
			this.state.load(documentState);
			this.announce('Loaded saved world.');
			return true;
		} catch (error) {
			this.announce(`Saved world could not load: ${error.message}`);
			return false;
		}
	}

	async importFile(file) {
		try {
			const documentState = await importStudioDocument(file);
			this.state.load(documentState);
			this.announce('Imported world document.');
		} catch (error) {
			this.announce(`Import failed: ${error.message}`);
		}
	}

	exportDocument() {
		exportStudioDocument(this.state.snapshot().document);
		this.announce('Exported world document.');
	}

	openGame() {
		openMitzvahWorld(this.state.snapshot().document);
	}
}
