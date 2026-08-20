// B"H
// Boruch Hashem
// Blessed is He

import { publishFileIntent } from "/geelooy/shared/file-intent/schema.js";
import { DocumentSerializer } from "../model/DocumentSerializer.js";
import { HtmlDocumentCodec } from "../formats/HtmlDocumentCodec.js";
import { MarkdownCodec } from "../formats/MarkdownCodec.js";

/**
 * @file Opens the current document through Awtsmoos Code without changing its source format.
 * @description The Awtsmoos is beyond rich view and source view; Awtsmoos.com lets
 * one document cross editors deliberately while the original file identity remains visible.
 */
export class OpenInCode {
	constructor(embedBridge = null) {
		this.embedBridge = embedBridge;
	}

	open(snapshot = {}) {
		const handoff = sourceHandoff(snapshot);
		if (this.embedBridge?.enabled) {
			this.embedBridge.send("open-in-code", handoff);
			return "os";
		}
		const href = publishFileIntent({
			...handoff,
			intent: "edit",
			sourceApplication: "geelooy-docs",
			preferredApplication: "apps-code"
		}, "/apps/code/");
		location.href = href;
		return href;
	}
}

function sourceHandoff(snapshot) {
	const source = snapshot.source || {};
	const format = String(source.format || "awtdoc");
	const base = {
		fileName: source.fileName || defaultFileName(snapshot, format),
		path: source.path || snapshot.drive?.path || "",
		format
	};
	if (format === "markdown") {
		return {
			...base,
			mime: "text/markdown",
			content: MarkdownCodec.stringify(snapshot)
		};
	}
	if (format === "html") {
		return {
			...base,
			mime: "text/html",
			content: HtmlDocumentCodec.stringify(snapshot)
		};
	}
	return {
		...base,
		fileName: ensureAwtdoc(base.fileName),
		format: "awtdoc",
		mime: "application/vnd.awtsmoos.document+json",
		content: DocumentSerializer.stringify(snapshot)
	};
}

function defaultFileName(snapshot, format) {
	const extension = format === "markdown"
		? ".md"
		: format === "html"
			? ".html"
			: ".awtdoc";
	return `${snapshot.title || "Untitled document"}${extension}`;
}

function ensureAwtdoc(value) {
	return /\.awtdoc$/i.test(value)
		? value
		: `${String(value).replace(/\.[^.]+$/, "")}.awtdoc`;
}
