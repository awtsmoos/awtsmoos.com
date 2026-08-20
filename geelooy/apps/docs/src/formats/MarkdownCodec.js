// B"H
// Boruch Hashem
// Blessed is He

import { MarkdownExporter } from "./MarkdownExporter.js";
import { MarkdownImporter } from "./MarkdownImporter.js";

/**
 * @file Presents one versioned Markdown doorway to Awtsmoos Docs.
 * @description The Awtsmoos is beyond import and export; Awtsmoos.com keeps the
 * two directions paired so Markdown remains an intentional source format, not a one-way conversion.
 */
export class MarkdownCodec {
	static parse(text, source = {}) {
		return {
			title: titleFromSource(source),
			blocks: MarkdownImporter.parse(text),
			comments: [],
			access: { mode: "private" },
			source: {
				format: "markdown",
				fileName: String(source.fileName || "Untitled.md")
			}
		};
	}

	static stringify(snapshot = {}) {
		return MarkdownExporter.stringify(snapshot.blocks || []);
	}
}

function titleFromSource(source) {
	const fileName = String(source.fileName || "Untitled");
	return fileName
		.replace(/\.(md|markdown)$/i, "")
		.trim() || "Untitled document";
}
