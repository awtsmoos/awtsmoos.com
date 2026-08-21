// B"H
// Boruch Hashem
// Blessed is He

import { docxRunsFromHtml } from "./DocxRunWriter.js";
import { xmlEscape } from "./DocxExportEscapes.js";

/**
 * @file Converts semantic Awtsmoos document blocks into WordprocessingML body structures.
 * @description The Awtsmoos is beyond paragraph and table; Awtsmoos.com lets headings,
 * lists, measured paragraph rhythm, quotes, code, dividers, and tables descend into honest Word vessels.
 */
export function docxBlockXml(block = {}) {
	if (block.tag === "table") return tableXml(block.html);
	if (block.tag === "ul" || block.tag === "ol") return listXml(block);
	if (block.tag === "hr") return dividerXml();
	return paragraphXml(block);
}

function paragraphXml(block) {
	const namedStyle = paragraphStyle(block.tag);
	const properties = paragraphProperties(block.style, namedStyle);
	const html = block.tag === "pre"
		? `<code>${block.html || ""}</code>`
		: block.html || "";
	return `<w:p>${properties}${docxRunsFromHtml(html)}</w:p>`;
}

function paragraphStyle(tag) {
	return {
		h1: "Title",
		h2: "Heading1",
		h3: "Heading2",
		h4: "Heading3",
		h5: "Heading4",
		h6: "Heading5",
		blockquote: "Quote",
		pre: "Code"
	}[tag] || "";
}

function paragraphProperties(style = {}, namedStyle = "") {
	const parts = [];
	if (namedStyle) parts.push(`<w:pStyle w:val="${namedStyle}"/>`);
	if (style.textAlign) parts.push(`<w:jc w:val="${xmlEscape(style.textAlign)}"/>`);
	const before = emToTwips(style.spaceBefore);
	const after = emToTwips(style.spaceAfter);
	const line = lineTwips(style.lineHeight);
	if (before || after || line) {
		parts.push(`<w:spacing w:before="${before}" w:after="${after}"${line ? ` w:line="${line}" w:lineRule="auto"` : ""}/>`);
	}
	const left = emToTwips(style.indentLeft);
	const first = emToTwips(style.firstLineIndent);
	if (left || first) {
		const firstAttribute = first >= 0
			? ` w:firstLine="${first}"`
			: ` w:hanging="${Math.abs(first)}"`;
		parts.push(`<w:ind w:left="${left}"${firstAttribute}/>`);
	}
	return parts.length ? `<w:pPr>${parts.join("")}</w:pPr>` : "";
}

function listXml(block) {
	const template = document.createElement("template");
	template.innerHTML = block.html || "";
	const items = Array.from(template.content.querySelectorAll("li"));
	if (!items.length) return paragraphXml(block);
	return items.map((item, index) => {
		const prefix = block.tag === "ol" ? `${index + 1}. ` : "• ";
		return `<w:p>${paragraphProperties(block.style)}<w:r><w:t>${xmlEscape(prefix)}</w:t></w:r>${docxRunsFromHtml(item.innerHTML)}</w:p>`;
	}).join("");
}

function tableXml(html) {
	const template = document.createElement("template");
	template.innerHTML = html || "";
	const table = template.content.querySelector("table") || template.content;
	const rows = Array.from(table.querySelectorAll("tr"));
	if (!rows.length) return paragraphXml({ tag: "p", html });
	const body = rows
		.map(row => `<w:tr>${Array.from(row.children).map(cellXml).join("")}</w:tr>`)
		.join("");
	return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:insideH w:val="single" w:sz="4" w:color="D0D7DE"/><w:insideV w:val="single" w:sz="4" w:color="D0D7DE"/></w:tblBorders></w:tblPr>${body}</w:tbl>`;
}

function cellXml(cell) {
	return `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p>${docxRunsFromHtml(cell.innerHTML)}</w:p></w:tc>`;
}

function dividerXml() {
	return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="1" w:color="B6BEC8"/></w:pBdr></w:pPr></w:p>';
}

function emToTwips(value) {
	return Math.round((Number(value) || 0) * 240);
}

function lineTwips(value) {
	return Math.round((Number(value) || 0) * 240);
}
