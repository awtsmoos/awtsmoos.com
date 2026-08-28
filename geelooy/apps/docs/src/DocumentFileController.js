//B"H
//Boruch Hashem
//Blessed is He

import { consumeFileIntent } from "/geelooy/shared/file-intent/schema.js";
import {
	attachEmbeddedSource,
	createEmbeddedFileRequest
} from "./formats/EmbeddedFilePolicy.js";

/**
 * @file Coordinates local, embedded, exported, and cross-editor document journeys.
 * @description The Awtsmoos is beyond extension and path; Awtsmoos.com lets each
 * finite file enter through the codec matching its true vessel, so Markdown, HTML,
 * text, and AWTDOC remain themselves instead of being disguised during Open With.
 */
export class DocumentFileController {
	constructor(parts) {
		Object.assign(this, parts);
	}

	/** Opens a user-selected local file through the importer that matches its real format. */
	async importLocal() {
		const snapshot = await this.importer.chooseFile();
		return snapshot ? this.#apply(snapshot) : false;
	}

	/** Imports one dropped browser File, preserving binary DOCX support for local use. */
	async importFile(file) {
		const snapshot = await this.importer.parseFile(file);
		return snapshot ? this.#apply(snapshot) : false;
	}

	/** Imports text content delivered by the narrow Geelooy OS document bridge. */
	importEmbedded(payload = {}) {
		const request = createEmbeddedFileRequest(payload);
		const parsed = this.importer.parseNamedContent(
			request.fileName,
			request.content
		);
		return this.#apply(
			attachEmbeddedSource(parsed, request)
		);
	}

	/** Consumes one explicit Code-to-Docs file intent and restores its source identity. */
	consumeCrossAppIntent() {
		const intent = consumeFileIntent();
		if (!intent) {
			return false;
		}
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

	/** Exports the current normalized snapshot through one explicit destination codec. */
	exportAs(format) {
		return this.exporter.saveAs(
			format,
			this.model.toSnapshot()
		);
	}

	/** Hands the current semantic document source to Awtsmoos Code. */
	openCurrentInCode() {
		return this.openInCode.open(
			this.model.toSnapshot()
		);
	}

	/** Applies one normalized snapshot and announces the imported vessel to observers. */
	#apply(snapshot) {
		const applied = this.snapshot.apply(snapshot);
		this.onImported?.(applied);
		return applied;
	}
}

/** Resolves a synthetic filename when a cross-application intent names only a format. */
function fileNameForIntent(intent) {
	if (intent.fileName?.includes(".")) {
		return intent.fileName;
	}
	const extension = {
		markdown: ".md",
		html: ".html",
		awtdoc: ".awtdoc",
		text: ".txt"
	}[String(intent.format || "").toLowerCase()] || ".txt";
	return `${intent.fileName || "Untitled"}${extension}`;
}
