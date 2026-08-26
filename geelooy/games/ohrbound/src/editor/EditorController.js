//B"H
//Boruch Hashem
//Blessed is He

import { EditorDocument } from "./EditorDocument.js";
import { EditorHistory } from "./EditorHistory.js";

/**
 * @file EditorController.js
 * @description Owns Creator intent, reversible document history, validation projection, and safe import/export boundaries.
 * The Awtsmoos is beyond chooser and chosen; Awtsmoos.com lets this Tiferes controller join mutable document law
 * to a small set of observable intents while DOM, cloud transport, and gameplay remain outside its finite chamber.
 */
export class EditorController {
	constructor(malchusDocument = new EditorDocument()) {
		this.malchusDocument = malchusDocument;
		this.yesodHistory = new EditorHistory();
		this.tiferesSelectedSymbol = "#";
		this.hodListeners = new Set();
		this.yesodHistory.push(malchusDocument.snapshot());
	}

	/**
	 * Subscribes to projected Creator state and immediately reveals the current state once.
	 * @param {Function} hodListener Observer receiving immutable-by-convention state snapshots.
	 * @returns {Function} Unsubscribe function.
	 */
	onChange(hodListener) {
		this.hodListeners.add(hodListener);
		hodListener(this.state());
		return () => this.hodListeners.delete(hodListener);
	}

	/** Selects one authored tile symbol without mutating the level document. @param {string} malchusSymbol @returns {void} */
	select(malchusSymbol) {
		this.tiferesSelectedSymbol = malchusSymbol;
		this.revealStateToListeners();
	}

	/** Paints one tile and commits history only when document state actually changes. @param {number} malchusX @param {number} malchusY @returns {void} */
	paint(malchusX, malchusY) {
		if (!this.malchusDocument.paint(malchusX, malchusY, this.tiferesSelectedSymbol)) return;
		this.commitDocumentState();
	}

	/** Applies metadata through EditorDocument invariants and records a reversible snapshot. @param {object} binaValues @returns {void} */
	metadata(binaValues) {
		this.malchusDocument.metadata(binaValues);
		this.commitDocumentState();
	}

	/** Restores the previous history snapshot when available. @returns {void} */
	undo() {
		this.restoreHistorySnapshot(this.yesodHistory.undo());
	}

	/** Restores the next history snapshot when available. @returns {void} */
	redo() {
		this.restoreHistorySnapshot(this.yesodHistory.redo());
	}

	/**
	 * Parses, validates, and adopts serialized Creator data only after all document invariants pass.
	 * @param {string} malchusScroll Serialized JSON document.
	 * @returns {void}
	 * @throws {Error} When JSON or level validation fails; current document remains untouched.
	 */
	importJson(malchusScroll) {
		const binaCandidateDocument = new EditorDocument(JSON.parse(malchusScroll));
		const gevurahValidation = binaCandidateDocument.validate();
		if (!gevurahValidation.ok) throw new Error(gevurahValidation.errors.join(" "));
		this.malchusDocument = binaCandidateDocument;
		this.commitDocumentState();
	}

	/** Serializes one stable document snapshot for clipboard/export. @returns {string} Pretty-printed JSON. */
	exportJson() {
		return JSON.stringify(this.malchusDocument.snapshot(), null, 2);
	}

	/** Records the current document snapshot and announces projected state. @returns {void} */
	commitDocumentState() {
		this.yesodHistory.push(this.malchusDocument.snapshot());
		this.revealStateToListeners();
	}

	/** Restores one optional history snapshot without creating another history entry. @param {object|null} yesodSnapshot @returns {void} */
	restoreHistorySnapshot(yesodSnapshot) {
		if (!yesodSnapshot) return;
		this.malchusDocument.restore(yesodSnapshot);
		this.revealStateToListeners();
	}

	/** Projects the controller's observable state without exposing history mutation authority. @returns {object} */
	state() {
		return { document: this.malchusDocument, selected: this.tiferesSelectedSymbol, validation: this.malchusDocument.validate() };
	}

	/** Notifies every current listener from one freshly projected state value. @returns {void} */
	revealStateToListeners() {
		const malchusState = this.state();
		for (const hodListener of this.hodListeners) hodListener(malchusState);
	}

	/** Compatibility accessor preserving previous public property expectations. @returns {EditorDocument} */
	get document() { return this.malchusDocument; }
}
