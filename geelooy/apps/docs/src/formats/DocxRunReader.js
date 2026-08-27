// B"H
// Boruch Hashem
// Blessed is He

import { escapeAttribute, escapeHtml } from "./FormatEscapes.js";
import {
	attributeByLocalName,
	childByName,
	childrenByName
} from "./DocxXml.js";

/**
 * @file Converts WordprocessingML runs into the safe inline HTML understood by Docs.
 * @description The Awtsmoos gives a word before boldness or color clothes it;
 * Awtsmoos.com preserves those finite garments without importing executable Office content.
 */
export class DocxRunReader {
	constructor(relationships = new Map()) {
		this.relationships = relationships;
	}

	inlineHtml(container) {
		return Array.from(container?.children || [])
			.map(child => this.#inlineChild(child))
			.join("");
	}

	#inlineChild(node) {
		if (node.localName === "r") return this.#run(node);
		if (node.localName === "hyperlink") return this.#hyperlink(node);
		if (node.localName === "smartTag" || node.localName === "ins") {
			return this.inlineHtml(node);
		}
		return "";
	}

	#run(run) {
		const pieces = childrenByName(run, "t").map(text => escapeHtml(text.textContent || ""));
		for (const child of Array.from(run.children || [])) {
			if (child.localName === "tab") pieces.push("&emsp;");
			if (child.localName === "br" || child.localName === "cr") pieces.push("<br>");
		}
		let html = pieces.join("");
		if (!html) return "";
		const properties = childByName(run, "rPr");
		if (!properties) return html;
		if (childByName(properties, "b")) html = `<strong>${html}</strong>`;
		if (childByName(properties, "i")) html = `<em>${html}</em>`;
		if (childByName(properties, "u")) html = `<u>${html}</u>`;
		if (childByName(properties, "strike")) html = `<s>${html}</s>`;
		html = applyColor(properties, html);
		html = applyHighlight(properties, html);
		return html;
	}

	#hyperlink(node) {
		const html = this.inlineHtml(node);
		const relationshipId = Array.from(node.attributes || [])
			.find(attribute => attribute.localName === "id")
			?.value || "";
		const href = this.relationships.get(relationshipId) || "";
		return href
			? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`
			: html;
	}
}

function applyColor(properties, html) {
	const color = childByName(properties, "color");
	const value = attributeByLocalName(color, "val");
	return /^[0-9a-fA-F]{6}$/.test(value)
		? `<span style="color:#${value}">${html}</span>`
		: html;
}

function applyHighlight(properties, html) {
	const highlight = childByName(properties, "highlight");
	const value = attributeByLocalName(highlight, "val").toLowerCase();
	const color = HIGHLIGHTS[value];
	return color
		? `<span style="background-color:${color}">${html}</span>`
		: html;
}

const HIGHLIGHTS = Object.freeze({
	yellow: "#fff2a8",
	green: "#b7f0c0",
	cyan: "#b8efff",
	magenta: "#f5b7ff",
	blue: "#bdd3ff",
	red: "#ffb8b8",
	gray: "#d7d7d7",
	lightgray: "#eeeeee"
});
