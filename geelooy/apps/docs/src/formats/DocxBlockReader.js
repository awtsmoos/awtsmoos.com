// B"H
// Boruch Hashem
// Blessed is He

import { DocxRunReader } from "./DocxRunReader.js";
import {
	attributeByLocalName,
	childByName,
	childrenByName
} from "./DocxXml.js";

/**
 * @file Converts WordprocessingML body children into Awtsmoos Docs semantic blocks.
 * @description The Awtsmoos renews paragraph and table alike; Awtsmoos.com maps
 * Word's finite structures into editor blocks without carrying Office machinery into the page.
 */
export class DocxBlockReader {
	constructor(relationships = new Map()) {
		this.runs = new DocxRunReader(relationships);
	}

	read(body) {
		const blocks = [];
		for (const child of Array.from(body?.children || [])) {
			if (child.localName === "p") blocks.push(this.#paragraph(child));
			if (child.localName === "tbl") blocks.push(this.#table(child));
		}
		return blocks.filter(Boolean);
	}

	#paragraph(paragraph) {
		const tag = paragraphTag(paragraph);
		const html = this.runs.inlineHtml(paragraph);
		if (!html && tag !== "p") return createBlock(tag, "");
		if (!html) return null;
		if (isListParagraph(paragraph)) {
			return createBlock("ul", `<li>${html}</li>`);
		}
		return createBlock(tag, html);
	}

	#table(table) {
		const rows = childrenByName(table, "tr")
			.map(row => this.#tableRow(row))
			.join("");
		return rows
			? createBlock("table", `<tbody>${rows}</tbody>`)
			: null;
	}

	#tableRow(row) {
		const cells = childrenByName(row, "tc")
			.map(cell => `<td>${this.#cellHtml(cell)}</td>`)
			.join("");
		return `<tr>${cells}</tr>`;
	}

	#cellHtml(cell) {
		const paragraphs = childrenByName(cell, "p")
			.map(paragraph => this.runs.inlineHtml(paragraph))
			.filter(Boolean);
		return paragraphs.join("<br>");
	}
}

function paragraphTag(paragraph) {
	const properties = childByName(paragraph, "pPr");
	const style = childByName(properties, "pStyle");
	const value = attributeByLocalName(style, "val")
		.toLowerCase()
		.replace(/\s+/g, "");
	if (value === "title") return "h1";
	if (/^heading1$/.test(value)) return "h2";
	if (/^heading[23]$/.test(value)) return "h3";
	return "p";
}

function isListParagraph(paragraph) {
	const properties = childByName(paragraph, "pPr");
	return Boolean(childByName(properties, "numPr"));
}

function createBlock(tag, html) {
	return {
		id: crypto.randomUUID(),
		tag,
		html
	};
}
