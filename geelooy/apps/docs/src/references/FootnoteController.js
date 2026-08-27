// B"H
// Boruch Hashem
// Blessed is He

import { escapeHtml } from "../formats/FormatEscapes.js";
import {
	createSemanticObject,
	normalizeSemanticObject
} from "../model/SemanticObjectPolicy.js";
import { insertSemanticReference } from "./SemanticReferenceInsertion.js";

/**
 * @file Coordinates insertion, editing, numbering, and navigation for Awtsmoos note references.
 * @description The Awtsmoos is beyond reference and explanation; Awtsmoos.com binds
 * stable semantic meaning to a fleeting cursor while keeping registry mutation separate
 * from numbered projection, so history and collaboration may later carry the same truth.
 */
export class FootnoteController {
	constructor(parts) {
		Object.assign(this, parts);
		this.onRegistryChange = null;
		this.bound = false;
	}

	/** Binds inline reference clicks once so superscripts reveal their definitions. */
	bind() {
		if (this.bound) return;
		this.bound = true;
		this.editor.root.addEventListener("click", event => this.#referenceClick(event));
	}

	/** Creates a footnote or endnote definition and inserts its stable reference marker. */
	async insert(kind) {
		this.bookmark.capture();
		const values = await this.quickDialog.ask({
			title: kind === "endnote" ? "Add endnote" : "Add footnote",
			fields: [{
				name: "content",
				label: "Note",
				type: "textarea",
				placeholder: "Write the note…",
				required: true,
				maxLength: 12000,
				rows: 6
			}],
			submitLabel: "Insert"
		});
		this.bookmark.restore();
		const text = String(values?.content || "").trim();
		if (!text) return false;
		const object = createSemanticObject(kind, escapeHtml(text));
		if (!object) return false;
		const previous = [...this.model.semanticObjects];
		this.#commit([...previous, object]);
		if (!insertSemanticReference(this.editor, object)) {
			this.#commit(previous);
			return false;
		}
		this.view.openPanel("references");
		this.refresh(object.id);
		return true;
	}

	/** Edits one existing definition while preserving its stable identity and kind. */
	async edit(objectId) {
		const object = this.model.semanticObjects.find(item => item.id === objectId);
		if (!object) return false;
		const values = await this.quickDialog.ask({
			title: object.kind === "endnote" ? "Edit endnote" : "Edit footnote",
			fields: [{
				name: "content",
				label: "Note",
				type: "textarea",
				value: plainText(object.content),
				required: true,
				maxLength: 12000,
				rows: 6
			}],
			submitLabel: "Save"
		});
		if (!values) return false;
		const updated = normalizeSemanticObject({
			...object,
			content: escapeHtml(String(values.content || "").trim())
		});
		if (!updated) return false;
		this.#commit(this.model.semanticObjects.map(item => item.id === objectId ? updated : item));
		this.refresh(objectId);
		return true;
	}

	/** Re-derives editor numbering and workspace content after any semantic or block change. */
	refresh(focusId = "") {
		const index = this.projector.render(this.model.blocks, this.model.semanticObjects);
		this.workspace.render(index);
		if (focusId) this.workspace.focus(focusId);
		return index;
	}

	/** Scrolls from a definition back to its first visible document reference. */
	jump(objectId) {
		const marker = this.editor.root.querySelector(`[data-semantic-ref="${CSS.escape(objectId)}"]`);
		if (!marker) return false;
		marker.scrollIntoView({ behavior: "smooth", block: "center" });
		marker.classList.add("is-reference-focus");
		setTimeout(() => marker.classList.remove("is-reference-focus"), 1200);
		return true;
	}

	#commit(objects) {
		if (this.onRegistryChange) this.onRegistryChange(objects);
		else this.model.setSemanticObjects(objects);
	}

	#referenceClick(event) {
		const marker = event.target.closest("[data-semantic-ref]");
		if (!marker) return;
		this.view.openPanel("references");
		this.refresh(marker.dataset.semanticRef);
	}
}

function plainText(html) {
	const template = document.createElement("template");
	template.innerHTML = String(html || "");
	return template.content.textContent || "";
}
