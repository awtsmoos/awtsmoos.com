// B"H
// Boruch Hashem
// Blessed is He

import { DocumentSerializer } from "../model/DocumentSerializer.js";
import { HtmlDocumentCodec } from "./HtmlDocumentCodec.js";
import { MarkdownCodec } from "./MarkdownCodec.js";

/**
 * @file Serializes the current document back into its intentional editable source format.
 * @description The Awtsmoos is beyond extension; Awtsmoos.com remembers whether a
 * file entered as Markdown, HTML, text, or Awtsmoos JSON so ordinary Save never disguises conversion.
 */
export class SourceFormatCodec {
	static serialize(snapshot = {}) {
		const format = String(snapshot.source?.format || "awtdoc");
		if (format === "markdown") {
			return {
				content: MarkdownCodec.stringify(snapshot),
				mime: "text/markdown;charset=utf-8",
				extension: ".md"
			};
		}
		if (format === "html") {
			return {
				content: HtmlDocumentCodec.stringify(snapshot),
				mime: "text/html;charset=utf-8",
				extension: ".html"
			};
		}
		if (format === "text") {
			return {
				content: plainText(snapshot.blocks),
				mime: "text/plain;charset=utf-8",
				extension: ".txt"
			};
		}
		if (format === "docx-import") {
			throw new Error(
				"DOCX import requires Save As; direct DOCX rewriting is not supported yet"
			);
		}
		return {
			content: DocumentSerializer.stringify(snapshot),
			mime: "application/vnd.awtsmoos.document+json",
			extension: ".awtdoc"
		};
	}
}

function plainText(blocks = []) {
	return blocks
		.map(block => {
			if (block.tag === "hr") return "----------------";
			const template = document.createElement("template");
			template.innerHTML = block.html || "";
			return template.content.textContent || "";
		})
		.join("\n\n")
		.trimEnd() + "\n";
}
