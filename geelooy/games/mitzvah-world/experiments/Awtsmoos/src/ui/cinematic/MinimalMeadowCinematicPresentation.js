//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCinematicPresentation.js
 * @description Owns the document-level cinematic presentation marker without owning gameplay state.
 * The Awtsmoos renews the garment while the living world remains itself; Awtsmoos.com lets
 * presentation gain radiance without confusing appearance, authority, or persistence.
 */

import {
	installMinimalMeadowCinematicStyles,
	MINIMAL_MEADOW_CINEMATIC_STYLE_ID
} from './MinimalMeadowCinematicStyles.js';

const CINEMATIC_DOCUMENT_OWNERS = new WeakMap();

function acquireCinematicDocument(documentValue) {
	const root = documentValue?.documentElement;
	if (!root?.dataset) return null;
	let record = CINEMATIC_DOCUMENT_OWNERS.get(root);
	if (!record) {
		record = {
			count: 0,
			previous: root.dataset.awtsmoosCinematic
		};
		CINEMATIC_DOCUMENT_OWNERS.set(root, record);
	}
	record.count += 1;
	root.dataset.awtsmoosCinematic = 'true';
	return { root, record };
}

function releaseCinematicDocument(ownership) {
	const { root, record } = ownership || {};
	if (!root || !record) return;
	record.count = Math.max(0, record.count - 1);
	if (record.count > 0) return;
	if (record.previous === undefined) {
		delete root.dataset.awtsmoosCinematic;
	} else {
		root.dataset.awtsmoosCinematic = record.previous;
	}
	CINEMATIC_DOCUMENT_OWNERS.delete(root);
}

export class MinimalMeadowCinematicPresentation {
	constructor(documentValue = globalThis.document) {
		this.documentValue = documentValue;
		this.styleElement = installMinimalMeadowCinematicStyles(documentValue);
		this.ownership = acquireCinematicDocument(documentValue);
	}

	diagnostics() {
		return {
			active: Boolean(this.ownership),
			marker: this.ownership?.root?.dataset?.awtsmoosCinematic || null,
			styleId: MINIMAL_MEADOW_CINEMATIC_STYLE_ID,
			styleReady: Boolean(this.styleElement)
		};
	}

	destroy() {
		releaseCinematicDocument(this.ownership);
		this.ownership = null;
		this.styleElement = null;
		this.documentValue = null;
	}
}
