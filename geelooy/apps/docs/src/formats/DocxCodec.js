// B"H
// Boruch Hashem
// Blessed is He

import { DocxBlockReader } from "./DocxBlockReader.js";
import { readDocxRelationships } from "./DocxRelationships.js";
import { descendantByName, parseXml } from "./DocxXml.js";
import { ZipDirectoryReader } from "./ZipDirectoryReader.js";
import { ZipEntryReader } from "./ZipEntryReader.js";

/**
 * @file Imports DOCX bytes directly through ZIP and WordprocessingML browser primitives.
 * @description The Awtsmoos is not owned by a vendor format; Awtsmoos.com opens
 * the package itself, reads inert XML, and reveals the supported document meaning without libraries.
 */
export class DocxCodec {
	static async parse(arrayBuffer, source = {}) {
		const entries = new ZipDirectoryReader(arrayBuffer).read();
		const byName = new Map(entries.map(entry => [entry.name, entry]));
		const documentEntry = byName.get("word/document.xml");
		if (!documentEntry) throw new Error("DOCX is missing word/document.xml");
		if (byName.has("word/vbaProject.bin")) {
			throw new Error("Macro-enabled Word packages are not accepted");
		}
		const reader = new ZipEntryReader(arrayBuffer);
		const documentXml = await reader.textFor(documentEntry);
		const relationshipXml = await optionalText(
			reader,
			byName.get("word/_rels/document.xml.rels")
		);
		const relationships = readDocxRelationships(relationshipXml);
		const parsed = parseXml(documentXml, "Word document XML");
		const body = descendantByName(parsed, "body");
		if (!body) throw new Error("DOCX document body is missing");
		const blocks = new DocxBlockReader(relationships).read(body);
		return {
			title: titleFromSource(source),
			blocks: blocks.length ? blocks : [emptyParagraph()],
			comments: [],
			access: { mode: "private" },
			source: {
				format: "docx-import",
				fileName: String(source.fileName || "Imported.docx")
			}
		};
	}
}

async function optionalText(reader, entry) {
	return entry ? await reader.textFor(entry) : "";
}

function emptyParagraph() {
	return {
		id: crypto.randomUUID(),
		tag: "p",
		html: ""
	};
}

function titleFromSource(source) {
	return String(source.fileName || "Imported document")
		.replace(/\.docx$/i, "")
		.trim() || "Imported document";
}
