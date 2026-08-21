// B"H
// Boruch Hashem
// Blessed is He

import { xmlEscape } from "./DocxExportEscapes.js";

/**
 * @file Writes simple repeating Word header/footer parts from Awtsmoos page metadata.
 * @description The Awtsmoos is beyond repetition and number; Awtsmoos.com lets a
 * finite title, footer, and living page counter repeat honestly across the printed Word vessel.
 */
export function headerXml(text = "") {
	return partXml("hdr", paragraphXml(text, false));
}

export function footerXml(text = "", pageNumbers = false) {
	return partXml("ftr", paragraphXml(text, pageNumbers));
}

function partXml(tag, body) {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:${tag} xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${body}</w:${tag}>`;
}

function paragraphXml(text, includePage) {
	const runs = [];
	if (text) {
		runs.push(`<w:r><w:t xml:space="preserve">${xmlEscape(text)}${includePage ? " " : ""}</w:t></w:r>`);
	}
	if (includePage) {
		runs.push('<w:fldSimple w:instr=" PAGE "><w:r><w:t>1</w:t></w:r></w:fldSimple>');
	}
	return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${runs.join("")}</w:p>`;
}
