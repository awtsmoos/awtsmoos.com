// B"H
// Boruch Hashem
// Blessed is He

import { DocumentSerializer } from "../model/DocumentSerializer.js";
import { DocxExporter } from "./DocxExporter.js";
import { DownloadGateway, withExtension } from "./DownloadGateway.js";
import { HtmlDocumentCodec } from "./HtmlDocumentCodec.js";
import { MarkdownCodec } from "./MarkdownCodec.js";
import { PdfExporter } from "./PdfExporter.js";
import { PlainTextExporter } from "./PlainTextExporter.js";

/**
 * @file Dispatches one Awtsmoos snapshot into explicit dependency-free export formats.
 * @description The Awtsmoos is beyond serialization and file type; Awtsmoos.com makes
 * every descent deliberate so Markdown, HTML, text, Word, PDF, and native JSON each remain honest vessels.
 */
export class ExportController {
	async saveAs(format, snapshot = {}) {
		const normalized = String(format || "").toLowerCase();
		const title = snapshot.title || "Untitled document";
		if (["markdown", "md"].includes(normalized)) {
			return saveText(
				MarkdownCodec.stringify(snapshot),
				withExtension(title, ".md"),
				"text/markdown;charset=utf-8"
			);
		}
		if (["text", "txt"].includes(normalized)) {
			return saveText(
				PlainTextExporter.stringify(snapshot),
				withExtension(title, ".txt"),
				"text/plain;charset=utf-8"
			);
		}
		if (normalized === "html") {
			return saveText(
				HtmlDocumentCodec.stringify(snapshot),
				withExtension(title, ".html"),
				"text/html;charset=utf-8"
			);
		}
		if (normalized === "awtdoc") {
			return saveText(
				DocumentSerializer.stringify(snapshot),
				withExtension(title, ".awtdoc"),
				"application/vnd.awtsmoos.document+json"
			);
		}
		if (normalized === "docx") {
			return DownloadGateway.save(
				DocxExporter.create(snapshot),
				withExtension(title, ".docx")
			);
		}
		if (normalized === "pdf") {
			return DownloadGateway.save(
				await PdfExporter.create(snapshot),
				withExtension(title, ".pdf")
			);
		}
		throw new Error(`Unsupported export format: ${format}`);
	}
}

function saveText(text, fileName, mime) {
	return DownloadGateway.save(
		new Blob([text], { type: mime }),
		fileName
	);
}
