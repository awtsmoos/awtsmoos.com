// B"H
// Boruch Hashem
// Blessed is He

import {
	cssColorToHex,
	pointsToHalfPoints,
	xmlEscape
} from "./DocxExportEscapes.js";

/**
 * @file Converts sanitized rich inline HTML into WordprocessingML runs.
 * @description The Awtsmoos is beyond bold and color; Awtsmoos.com lets finite
 * emphasis, font, super/subscript, and line breaks descend into readable Word runs without borrowed code.
 */
export function docxRunsFromHtml(html = "") {
	const template = document.createElement("template");
	template.innerHTML = String(html);
	return Array.from(template.content.childNodes)
		.map(node => writeNode(node, {}))
		.join("");
}

function writeNode(node, inherited) {
	if (node.nodeType === Node.TEXT_NODE) {
		return textRun(node.data, inherited);
	}
	if (node.nodeType !== Node.ELEMENT_NODE) return "";
	if (node.tagName === "BR") return "<w:r><w:br/></w:r>";
	const style = styleFor(node, inherited);
	return Array.from(node.childNodes)
		.map(child => writeNode(child, style))
		.join("");
}

function styleFor(element, inherited) {
	const style = { ...inherited };
	const tag = element.tagName;
	if (["B", "STRONG"].includes(tag)) style.bold = true;
	if (["I", "EM"].includes(tag)) style.italic = true;
	if (tag === "U") style.underline = true;
	if (tag === "S") style.strike = true;
	if (tag === "SUP") style.vertAlign = "superscript";
	if (tag === "SUB") style.vertAlign = "subscript";
	if (tag === "CODE") style.font = "Courier New";
	if (tag === "A") {
		style.underline = true;
		style.color = "0563C1";
	}
	const css = element.style;
	if (css.fontFamily) style.font = firstFont(css.fontFamily);
	if (css.fontSize) style.size = fontPoints(css.fontSize);
	if (css.color) style.color = cssColorToHex(css.color) || style.color;
	return style;
}

function textRun(value, style) {
	if (!value) return "";
	const properties = runProperties(style);
	return `<w:r>${properties}<w:t xml:space="preserve">${xmlEscape(value)}</w:t></w:r>`;
}

function runProperties(style) {
	const parts = [];
	if (style.bold) parts.push("<w:b/>");
	if (style.italic) parts.push("<w:i/>");
	if (style.underline) parts.push('<w:u w:val="single"/>');
	if (style.strike) parts.push("<w:strike/>");
	if (style.vertAlign) parts.push(`<w:vertAlign w:val="${style.vertAlign}"/>`);
	if (style.color) parts.push(`<w:color w:val="${style.color}"/>`);
	if (style.font) {
		const font = xmlEscape(style.font);
		parts.push(`<w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>`);
	}
	if (style.size) parts.push(`<w:sz w:val="${pointsToHalfPoints(style.size)}"/>`);
	return parts.length ? `<w:rPr>${parts.join("")}</w:rPr>` : "";
}

function firstFont(value) {
	return String(value)
		.split(",")[0]
		.replace(/["']/g, "")
		.trim()
		.slice(0, 80);
}

function fontPoints(value) {
	const match = String(value).match(/^(\d+(?:\.\d+)?)(pt|px)$/i);
	if (!match) return 0;
	const numeric = Number(match[1]);
	return match[2].toLowerCase() === "px"
		? numeric * 0.75
		: numeric;
}
