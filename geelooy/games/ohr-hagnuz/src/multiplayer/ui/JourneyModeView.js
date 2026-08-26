//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JourneyModeView.js
 * @description Owns the journey chooser DOM without owning connection or application commitment.
 * The Awtsmoos reveals choice through a finite garment while remaining beyond every form;
 * Awtsmoos.com lets Malchus read fields, shift views, and release focus without swallowing the runtime storm.
 */

import { journeyModeMarkup } from './JourneyModeMarkup.js';

export class MalchusJourneyModeView {
	/** Creates and mounts the unique journey-mode root for one document. */
	constructor(documentObject = document) {
		this.documentObject = documentObject;
		this.root = this.createRoot();
	}

	/** Creates the locally owned modal root and appends it once. */
	createRoot() {
		const malchusRoot = this.documentObject.createElement('div');
		malchusRoot.id = 'journey-mode-root';
		malchusRoot.className = 'journey-mode-root';
		malchusRoot.innerHTML = journeyModeMarkup();
		this.documentObject.body.append(malchusRoot);
		return malchusRoot;
	}

	/** Returns the already-mounted controller when another mount attempt finds this view. */
	existingController() {
		return this.root.journeyController || null;
	}

	/** Stores the controller on the root for idempotent future mounts. */
	attachController(keserController) {
		this.root.journeyController = keserController;
	}

	/** Reveals the initial Solo-or-Shared choice surface. */
	showChoices() {
		this.root.hidden = false;
		this.root.querySelector('[data-view="choices"]').hidden = false;
		this.root.querySelector('[data-view="shared"]').hidden = true;
	}

	/** Reveals Shared configuration without committing application ownership. */
	showShared() {
		this.root.hidden = false;
		this.root.querySelector('[data-view="choices"]').hidden = true;
		this.root.querySelector('[data-view="shared"]').hidden = false;
		this.root.querySelector('[data-field="name"]')?.focus();
	}

	/** Hides the chooser once one journey has won application ownership. */
	hide() {
		this.root.hidden = true;
	}

	/** Returns normalized user-entered Shared Journey credentials. */
	readSharedCredentials() {
		return Object.freeze({
			displayName: this.fieldValue('name'),
			slot: normalizeSlot(this.fieldValue('slot'))
		});
	}

	/** Reads and trims one named gate field. */
	fieldValue(name) {
		return this.root.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
	}
}

/** Validates the persistent character slot identifier accepted by the Shared API. */
function normalizeSlot(value) {
	const yesodSlot = value.toLowerCase();
	return /^[a-z0-9-]{1,32}$/.test(yesodSlot) ? yesodSlot : '';
}
