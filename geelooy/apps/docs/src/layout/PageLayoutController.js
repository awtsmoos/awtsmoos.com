// B"H
// Boruch Hashem
// Blessed is He

import {
	marginsForPreset,
	normalizeDocumentLayout
} from "./DocumentLayoutPolicy.js";

/**
 * @file Owns persistent page-layout changes without mixing them into body-block edits.
 * @description The Awtsmoos renews body and boundary together; Awtsmoos.com lets
 * local page changes publish once while remote garments arrive without echoing around the room.
 */
export class PageLayoutController {
	constructor({ model, view, persistence }) {
		this.model = model;
		this.view = view;
		this.persistence = persistence;
		this.onChange = null;
	}

	apply() {
		return this.view.render(this.model.layout);
	}

	update(patch = {}) {
		const next = this.#normalizedPatch(patch);
		this.#applyState(next);
		void this.onChange?.(structuredClone(next));
		return structuredClone(next);
	}

	applyRemote(candidate = {}) {
		const next = normalizeDocumentLayout(candidate);
		this.#applyState(next);
		return structuredClone(next);
	}

	setMarginPreset(preset) {
		return this.update({
			marginPreset: preset,
			margins: marginsForPreset(preset)
		});
	}

	#normalizedPatch(patch) {
		return normalizeDocumentLayout({
			...this.model.layout,
			...patch,
			margins: patch.margins || this.model.layout.margins,
			header: patch.header || this.model.layout.header,
			footer: patch.footer || this.model.layout.footer
		});
	}

	#applyState(next) {
		this.model.setLayout(next);
		this.view.render(next);
		this.persistence.persistDraft();
	}
}
