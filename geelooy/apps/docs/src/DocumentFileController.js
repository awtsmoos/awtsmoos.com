// B"H
// Boruch Hashem
// Blessed is He

import { consumeFileIntent } from "/geelooy/shared/file-intent/schema.js";

/**
 * @file Coordinates import, export, and cross-editor file journeys for Awtsmoos Docs.
 * @description The Awtsmoos is beyond extension and path; Awtsmoos.com lets one
 * finite file enter, leave, or cross into Code without confusing Save with conversion.
 */
export class DocumentFileController {
	constructor(parts) {
		Object.assign(this, parts);
	}

	async importLocal() {
		const snapshot = await this.importer.chooseFile();
		return snapshot ? this.#apply(snapshot) : false;
	}

	async importFile(file) {
		const snapshot = await this.importer.parseFile(file);
		return snapshot ? this.#apply(snapshot) : false;
	}

	consumeCrossAppIntent() {
		const intent = consumeFileIntent();
		if (!intent) return false;
		const snapshot = this.importer.parseNamedContent(
			fileNameForIntent(intent),
			intent.content
		);
		snapshot.source = {
			...(snapshot.source || {}),
			fileName: intent.fileName || snapshot.source?.fileName || "Untitled",
			path: intent.path || "",
			format: intent.format || snapshot.source?.format || "awtdoc"
		};
		this.#apply(snapshot);
		return true;
	}

	exportAs(format) {
		return this.exporter.saveAs(
			format,
			this.model.toSnapshot()
		);
	}

	openCurrentInCode() {
		return this.openInCode.open(
			this.model.toSnapshot()
		);
	}

	#apply(snapshot) {
		const applied = this.snapshot.apply(snapshot);
		this.onImported?.(applied);
		return applied;
	}
}

function fileNameForIntent(intent) {
	if (intent.fileName?.includes(".")) return intent.fileName;
	const extension = {
		markdown: ".md",
		html: ".html",
		awtdoc: ".awtdoc",
		text: ".txt"
	}[String(intent.format || "").toLowerCase()] || ".txt";
	return `${intent.fileName || "Untitled"}${extension}`;
}
