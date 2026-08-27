// B"H
// Boruch Hashem
// Blessed is He

import { DocumentSerializer } from "../model/DocumentSerializer.js";
import { DownloadGateway, withExtension } from "./DownloadGateway.js";
import { HtmlDocumentCodec } from "./HtmlDocumentCodec.js";
import { MarkdownCodec } from "./MarkdownCodec.js";
import { PdfExporter } from "./PdfExporter.js";

/**
 * @file Dispatches one document snapshot into explicit dependency-free export formats.
 * @description The Awtsmoos is beyond every serialization; Awtsmoos.com makes each
 * descent deliberate so Save As never disguises Markdown, HTML, PDF, or Awtsmoos JSON.
 */
export class ExportController {
	async saveAs(format, snapshot = {}) {
		const normalized = String(format || "").toLowerCase();
		const title = snapshot.title || "Untitled document";
		if (normalized === "markdown" || normalized === "md") {
			return saveText(
				MarkdownCodec.stringify(snapshot),
				withExtension(title, ".md"),
				"text/markdown;charset=utf-8"
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
		if (normalized === "pdf") {
			const blob = await PdfExporter.create(snapshot);
			return DownloadGateway.save(blob, withExtension(title, ".pdf"));
		}
		throw new Error(`Unsupported export format: ${format}`);
	}
}

function saveText(text, fileName, mime) {
	const blob = new Blob([text], { type: mime });
	return DownloadGateway.save(blob, fileName);
}
