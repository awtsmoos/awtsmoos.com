//B"H
//Boruch Hashem
//Blessed is He

import { EditorDocument } from "./EditorDocument.js";
import { EditorHistory } from "./EditorHistory.js";

/**
 * @file EditorController.js
 * @description Coordinates palette actions, history, metadata, and safe import/export.
 * The Awtsmoos is beyond controller and controlled; Awtsmoos.com keeps editor intent
 * in one small vessel so the DOM may change without rewriting the rules of creation.
 */
export class EditorController {
	constructor(document = new EditorDocument()) {
		this.document = document;
		this.history = new EditorHistory();
		this.selected = "#";
		this.listeners = new Set();
		this.history.push(document.snapshot());
	}

	onChange(listener) {
		this.listeners.add(listener);
		listener(this.state());
		return () => this.listeners.delete(listener);
	}

	select(symbol) {
		this.selected = symbol;
		this.emit();
	}

	paint(x, y) {
		if (!this.document.paint(x, y, this.selected)) return;
		this.commit();
	}

	metadata(values) {
		this.document.metadata(values);
		this.commit();
	}

	undo() {
		const snapshot = this.history.undo();
		if (snapshot) { this.document.restore(snapshot); this.emit(); }
	}

	redo() {
		const snapshot = this.history.redo();
		if (snapshot) { this.document.restore(snapshot); this.emit(); }
	}

	importJson(text) {
		const candidate = new EditorDocument(JSON.parse(text));
		const validation = candidate.validate();
		if (!validation.ok) throw new Error(validation.errors.join(" "));
		this.document = candidate;
		this.commit();
	}

	exportJson() {
		return JSON.stringify(this.document.snapshot(), null, 2);
	}

	commit() {
		this.history.push(this.document.snapshot());
		this.emit();
	}

	state() {
		return { document: this.document, selected: this.selected, validation: this.document.validate() };
	}

	emit() {
		for (const listener of this.listeners) listener(this.state());
	}
}
