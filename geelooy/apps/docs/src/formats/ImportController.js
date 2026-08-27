// B"H
// Boruch Hashem
// Blessed is He

import { DocumentSerializer } from "../model/DocumentSerializer.js";
import { DocxCodec } from "./DocxCodec.js";
import { escapeHtml } from "./FormatEscapes.js";
import { HtmlDocumentCodec } from "./HtmlDocumentCodec.js";
import { MarkdownCodec } from "./MarkdownCodec.js";

/**
 * @file Dispatches chosen or handed-off files into bounded document format codecs.
 * @description The Awtsmoos is beyond text and binary; Awtsmoos.com names each
 * finite vessel before its bytes enter a parser, whether opened locally or through Geelooy OS.
 */
export class ImportController {
	async chooseFile() {
		const file = await chooseLocalFile();
		return file ? await this.parseFile(file) : null;
	}

	async parseFile(file) {
		const extension = fileExtension(file.name);
		if (extension === "docx") {
			return await this.parseNamedBinary(file.name, await file.arrayBuffer());
		}
		return this.parseNamedContent(file.name, await file.text());
	}

	async parseNamedBinary(fileName, arrayBuffer) {
		if (fileExtension(fileName) !== "docx") {
			throw new Error("Only DOCX is accepted as a binary document import");
		}
		return await DocxCodec.parse(arrayBuffer, { fileName });
	}

	parseNamedContent(fileName, content) {
		const extension = fileExtension(fileName);
		if (extension === "awtdoc") {
			return detachImportedSnapshot(DocumentSerializer.parse(content), fileName);
		}
		if (["md", "markdown"].includes(extension)) {
			return MarkdownCodec.parse(content, { fileName });
		}
		if (["html", "htm"].includes(extension)) {
			return HtmlDocumentCodec.parse(content, { fileName });
		}
		if (extension === "txt") return plainTextSnapshot(content, fileName);
		throw new Error(`Unsupported import format: .${extension || "unknown"}`);
	}
}

function chooseLocalFile() {
	return new Promise(resolve => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".awtdoc,.md,.markdown,.html,.htm,.docx,.txt";
		input.addEventListener("change", () => resolve(input.files?.[0] || null), { once: true });
		input.click();
	});
}

function detachImportedSnapshot(snapshot, fileName) {
	return {
		...snapshot,
		id: "",
		revision: 0,
		access: { mode: "private" },
		source: { format: "awtdoc", fileName }
	};
}

function plainTextSnapshot(text, fileName) {
	const blocks = String(text)
		.replace(/\r\n?/g, "\n")
		.split(/\n{2,}/)
		.map(paragraph => ({
			id: crypto.randomUUID(),
			tag: "p",
			html: escapeHtml(paragraph).replace(/\n/g, "<br>")
		}));
	return {
		title: String(fileName || "Untitled.txt").replace(/\.txt$/i, ""),
		blocks,
		comments: [],
		access: { mode: "private" },
		source: { format: "text", fileName }
	};
}

function fileExtension(name) {
	return String(name || "").split(".").pop()?.toLowerCase() || "";
}
